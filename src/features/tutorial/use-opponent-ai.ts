import { useEffect, useRef, useState } from 'react';

import type { GameApi } from '@/features/game/hooks/use-game';
import { canPayAttackCost, canPlacePokemon, isPokemonCard } from '@/features/game/rules';
import type { Attack, PokemonCard, PokemonInPlay } from '@/features/game/types';

// =====================================================================
// ADVERSAIRE AUTOMATIQUE (joueur 2) — « test en autonomie » et « entraînement »
//
// Son schéma, à chaque tour :
//   1. il pose UN Pokémon de sa main (si les règles le permettent), de préférence
//      en face d'un de tes Pokémon ;
//   2. il attaque avec chacun de ses Pokémon de la ligne C, de gauche à droite,
//      avec l'attaque la plus forte qu'il peut payer ;
//   3. il finit son tour.
// Il répond tout seul aux pièces (au hasard), aux OUI / NON (oui) et aux choix de cible.
// =====================================================================

/** Temps entre deux gestes (pour que le joueur voie ce qui se passe). */
const AI_DELAY_MS = 800;
/** Au-delà de ce nombre de gestes sans progrès, il finit son tour. */
const MAX_STUCK_TICKS = 12;

const OWN_CELLS = ['C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
const OPPONENT_CELLS = ['B1', 'B2', 'B3', 'B4', 'A1', 'A2', 'A3', 'A4'];
const ALL_CELLS = [...OWN_CELLS, ...OPPONENT_CELLS];

type TurnMemory = {
  turnId: number;
  placed: boolean;
  attackTried: string[];
  stuck: number;
  clickIndex: number;
  // gestes à faire, un par tick (ex : choisir la carte puis la case)
  queue: ((game: GameApi) => void)[];
};

/** La plus forte attaque que ce Pokémon peut payer (ou null). */
function bestAttack(pokemon: PokemonInPlay): { index: number; attack: Attack } | null {
  let best: { index: number; attack: Attack } | null = null;
  pokemon.card.attacks.forEach((attack, index) => {
    if (!canPayAttackCost(pokemon.energies, attack)) return;
    if (!best || attack.damage > best.attack.damage) best = { index, attack };
  });
  return best;
}

export function useOpponentAI(rawGame: GameApi, enabled: boolean) {
  const gameRef = useRef(rawGame);
  gameRef.current = rawGame;
  const memoryRef = useRef<TurnMemory>({ turnId: -1, placed: false, attackTried: [], stuck: 0, clickIndex: 0, queue: [] });
  const [tick, setTick] = useState(0);

  const active =
    enabled && rawGame.setupPhase === 'battle' && !rawGame.gameOver && rawGame.currentPlayer === 2;

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      runTick(gameRef.current);
      setTick((value) => value + 1);
    }, AI_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tick]);

  function memoryFor(game: GameApi): TurnMemory {
    if (memoryRef.current.turnId !== game.turnId) {
      memoryRef.current = { turnId: game.turnId, placed: false, attackTried: [], stuck: 0, clickIndex: 0, queue: [] };
    }
    return memoryRef.current;
  }

  /** Clique tour à tour sur les cases d'une liste (pour un choix de cible). */
  function clickNext(game: GameApi, memory: TurnMemory, cells: string[]) {
    const candidates = cells.filter((cell) => game.board[cell]);
    const list = candidates.length > 0 ? candidates : cells;
    const cell = list[memory.clickIndex % list.length];
    memory.clickIndex += 1;
    memory.stuck += 1;
    game.handleCellPress(cell);
  }

  /** Répond à ce que le jeu demande au joueur 2. Renvoie vrai si quelque chose a été fait. */
  function answerPrompts(game: GameApi, memory: TurnMemory): boolean {
    // Pièces : au hasard, puis valider.
    if (game.pendingCoinFlip && game.pendingCoinFlip.player === 2) {
      const draft = game.coinDraft ?? [];
      const missing = Array.from({ length: game.pendingCoinFlip.coinCount }, (_, index) => index).find(
        (index) => !draft[index]
      );
      if (missing !== undefined) game.chooseCoinSide(missing, Math.random() < 0.5 ? 'face' : 'pile');
      else game.validatePendingCoinFlip();
      return true;
    }

    const dragon = game.pendingDragonEnergyChoices?.[0];
    if (dragon && dragon.player === 2) {
      const types = game.board[dragon.cellName]?.card.dragonEnergyTypes;
      if (types) game.chooseDragonEnergy(types[0]);
      return true;
    }

    // OUI / NON des attaques : toujours oui.
    if (game.pendingDiscardAllEnergyChoice) return game.resolveDiscardAllEnergyChoice(true), true;
    if (game.pendingOptionalBonusDamageChoice) return game.resolveOptionalBonusDamageChoice(true), true;
    if (game.pendingOptionalDiscardChoice) return game.resolveOptionalDiscardChoice(true), true;
    if (game.pendingOptionalAttackEffect) return game.resolveOptionalAttackEffectChoice(true), true;

    // Code des cartes
    const script = game.pendingScript;
    if (script && (script.chooser ?? script.player) === 2) {
      if (script.stage === 'optional') game.answerScriptOptional(true);
      else if (script.stage === 'card') game.answerScriptCard(game.scriptCardChoices?.length ? 0 : -1);
      else if (script.stage === 'attack') game.answerScriptCard(0);
      else if (script.stage === 'target' || script.stage === 'destination') clickNext(game, memory, ALL_CELLS);
      return true;
    }
    if (script) return true; // effet en cours chez l'autre joueur : on attend

    // Choisir un Pokémon adverse à attaquer
    if (game.pendingOpponentTarget && game.pendingOpponentTarget.player === 2) {
      const hasPokemon = OPPONENT_CELLS.some((cell) => game.board[cell]);
      if (hasPokemon) clickNext(game, memory, OPPONENT_CELLS);
      else game.handlePlayerTargetPress(1);
      return true;
    }

    // Choix sur son propre camp (Énergie à attacher, dégâts sur son banc, échange…)
    const ownChoice =
      game.pendingGeneratedBenchEnergy ||
      game.pendingBenchEnergyAttachment ||
      game.pendingEnergyTransferToBench ||
      game.pendingOwnBenchDamage ||
      (game.pendingOpponentActiveSwitch && game.pendingOpponentActiveSwitch.player === 2) ||
      (game.pendingKOEnergyMove && game.pendingKOEnergyMove.player === 2);
    if (ownChoice) {
      clickNext(game, memory, OWN_CELLS);
      return true;
    }

    return false;
  }

  function runTick(game: GameApi) {
    if (game.currentPlayer !== 2 || game.gameOver) return;
    const memory = memoryFor(game);

    // Gestes déjà prévus (choisir une carte puis une case, etc.)
    if (memory.queue.length > 0) {
      const next = memory.queue.shift()!;
      next(game);
      return;
    }

    if (answerPrompts(game, memory)) {
      if (memory.stuck > MAX_STUCK_TICKS) game.handleEndTurn();
      return;
    }

    // 1) Poser un Pokémon
    if (!memory.placed) {
      memory.placed = true;
      if (!game.hasPlacedThisTurn) {
        const card = game.player2Hand.find(
          (handCard): handCard is PokemonCard =>
            isPokemonCard(handCard) && (game.noPlacementRestrictions || canPlacePokemon(handCard, game.round, 2))
        );
        const freeCells = [1, 2, 3, 4].map((column) => `C${column}`).filter((cell) => !game.board[cell]);
        // de préférence en face d'un de tes Pokémon
        const cell =
          freeCells.find((free) => game.board[`B${free.slice(1)}`] || game.board[`A${free.slice(1)}`]) ?? freeCells[0];
        if (card && cell) {
          memory.queue.push((g) => g.handleHandCardPress(card, 2));
          memory.queue.push((g) => g.handleCellPress(cell));
          return;
        }
      }
    }

    // 2) Attaquer, colonne par colonne
    for (const column of [1, 2, 3, 4]) {
      const cell = `C${column}`;
      const pokemon = game.board[cell];
      if (!pokemon || pokemon.owner !== 2 || pokemon.hasAttacked || memory.attackTried.includes(cell)) continue;
      memory.attackTried.push(cell);
      const choice = bestAttack(pokemon);
      if (!choice) continue;
      game.handleCellPress(cell);
      memory.queue.push((g) =>
        g.handleSelectAttack(choice.index, `${pokemon.card.name} prépare ${choice.attack.name}.`)
      );
      memory.queue.push((g) => g.tryAttackSelectedPokemon());
      return;
    }

    // 3) Fin du tour
    game.handleEndTurn();
  }
}
