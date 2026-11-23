import { useEffect, useRef, useState } from 'react';

import {
  applySpecialConditions,
  applySpecialConditionsToPlayer,
  canAttachEnergyFromSource,
  createPokemonInPlay,
  createScriptModifier,
  describeModifier,
  getActiveModifiers,
  getDefaultScriptSide,
  getKOPenalty,
  getOpponentPlacementDamage,
  getPokemonMaxHp,
  getRecoverableCards,
  type SummonChoices,
  isPokemonCard,
  pokemonOnly,
  getScriptMaxHpBonus,
  getTalentDamageReduction,
  computeScriptCount,
  isScriptConditionMet,
  hasScriptImmunity,
  isActivePokemonCell,
  isHealBlocked,
  isModifierAction,
  isTalentNegatedAt,
  matchesPokemonFilter,
  syncAuraModifiers,
} from '@/features/game/rules';
import { CARD_SERIES_LIST, type CardSeriesInfo } from '@/features/game/data';
import type {
  BoardState,
  EnergyType,
  GameCard,
  PendingScript,
  Player,
  PlayerStatusState,
  PokemonInPlay,
  ScriptBlock,
  SetState,
  TrainerCard,
} from '@/features/game/types';

type UseGameScriptsOptions = {
  board: BoardState;
  currentPlayer: Player;
  turnId: number;
  setBoard: SetState<BoardState>;
  setMessage: SetState<string>;
  pendingScript: PendingScript | null;
  setPendingScript: SetState<PendingScript | null>;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
  // étape 3 : main et défausse
  player1Discard: GameCard[];
  player2Discard: GameCard[];
  player1DiscardEnergies: EnergyType[];
  player2DiscardEnergies: EnergyType[];
  player1Hand: GameCard[];
  player2Hand: GameCard[];
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  // série de la partie (summon avec pokemonName)
  cardSeries: CardSeriesInfo;
  // action endTurn
  endTurn: () => void;
  // plateau remis par « Annuler le tour » : pas de déclencheur
  ignoreTriggerBoardRef?: { current: unknown };
  // déclencheurs actifs seulement pendant le combat
  triggersActive?: boolean;
  // Invocations choisies à la préparation (summon avec `pokemon`)
  player1SummonChoices: SummonChoices;
  player2SummonChoices: SummonChoices;
  setPlayer1Status: SetState<PlayerStatusState>;
  setPlayer2Status: SetState<PlayerStatusState>;
  startPokemonCoinFlip: (cellName: string, coinCount: number) => void;
  startTrainerCoinFlip: (trainer: TrainerCard, player: Player, coinCount: number) => void;
  prepareKOEnergyMove: (pokemon: PokemonInPlay, boardAfterKO: BoardState) => boolean;
};

const PLAYER_TARGET = (player: Player) => `joueur-${player}`;

/** Actions qui demandent une case d'arrivée (`to`). */
const DESTINATION_ACTIONS: ScriptBlock['action'][] = ['switch', 'moveEnergy', 'moveDamage', 'swapDamage'];

/** Lignes d'un joueur, de l'avant vers l'arrière. */
const ROWS: Record<Player, string[]> = { 1: ['B', 'A'], 2: ['C', 'D'] };

/** Retire `removed` (une fois chacune) d'une liste d'Énergies. */
function removeEnergies(list: EnergyType[], removed: EnergyType[]): EnergyType[] {
  const next = [...list];
  for (const energy of removed) {
    const index = next.indexOf(energy);
    if (index >= 0) next.splice(index, 1);
  }
  return next;
}

/**
 * Trouve une carte Pokémon par son nom (sans accents ni majuscules) :
 * d'abord dans la série de la partie, sinon dans toutes les séries.
 */
function findPokemonCardByName(name: string, series: CardSeriesInfo) {
  const clean = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const wanted = clean(name);
  const lists = [series.pokemon, ...CARD_SERIES_LIST.map((other) => other.pokemon)];

  for (const list of lists) {
    const found =
      list.find((card) => clean(card.name) === wanted) ??
      list.find((card) => clean(card.name).startsWith(wanted));
    if (found) return found;
  }
  return null;
}

/** Camp par défaut d'une action. */
const getDefaultSide = getDefaultScriptSide;

/** Identifiant d'origine d'une carte (une copie invoquée a « ~inv… » en plus). */
function baseCardId(id: string): string {
  return id.split('~')[0];
}

/** Ajoute `next` à la fin de la file de scripts `current`. */
function appendScript(current: PendingScript | null, next: PendingScript): PendingScript {
  if (!current) return next;
  return { ...current, then: appendScript(current.then ?? null, next) };
}

/**
 * Le « code des cartes » : applique un script bloc par bloc.
 * Un script démarre en mettant `pendingScript` (stage 'run') ; il s'arrête pour
 * attendre un OUI / NON, une pièce ou un clic, puis reprend.
 */
export function useGameScripts(options: UseGameScriptsOptions) {
  const { board, pendingScript, setPendingScript, setMessage, setBoard } = options;

  // Traitement après l'affichage : le plateau est à jour (dégâts de l'attaque compris).
  useEffect(() => {
    if (pendingScript?.stage === 'run') {
      runScript(pendingScript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingScript]);

  // endTurn : on termine le tour quand plus aucun script n'attend.
  const [endTurnRequested, setEndTurnRequested] = useState(false);
  useEffect(() => {
    if (endTurnRequested && !pendingScript) {
      setEndTurnRequested(false);
      options.endTurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTurnRequested, pendingScript]);

  // whenPlayed : un Pokémon vient d'être joué (posé, évolué, invoqué) ;
  // son talent passif peut contenir { action: 'whenPlayed', script: [...] }.
  const playedBoardRef = useRef<BoardState>(board);
  useEffect(() => {
    const previous = playedBoardRef.current;
    playedBoardRef.current = board;
    if (previous === board) return;
    if (options.triggersActive === false || options.ignoreTriggerBoardRef?.current === board) return;

    // Combien de fois chaque carte est en jeu (pour ne pas confondre avec un simple déplacement).
    const countCards = (state: BoardState) => {
      const counts: Record<string, number> = {};
      for (const pokemon of Object.values(state)) {
        if (pokemon) counts[`${pokemon.owner}-${pokemon.card.id}`] = (counts[`${pokemon.owner}-${pokemon.card.id}`] ?? 0) + 1;
      }
      return counts;
    };
    const before = countCards(previous);
    const after = countCards(board);
    const seen: Record<string, number> = {};
    const triggers: PendingScript[] = [];

    for (const [cell, pokemon] of Object.entries(board)) {
      if (!pokemon) continue;
      const key = `${pokemon.owner}-${pokemon.card.id}`;
      const old = previous[cell];
      const isNewHere = !old || old.owner !== pokemon.owner || old.card.id !== pokemon.card.id;
      if (!isNewHere) continue;
      // nouvelle carte en jeu (pas un déplacement) ?
      seen[key] = (seen[key] ?? 0) + 1;
      if ((after[key] ?? 0) - (before[key] ?? 0) < seen[key]) continue;

      const talent = pokemon.card.talent;
      if (!talent || talent.type !== 'passive' || talent.effect !== 'script') continue;
      if (isTalentNegatedAt(board, cell, pokemon.owner, pokemon.card)) continue;

      for (const block of talent.script ?? []) {
        if (block.action !== 'whenPlayed' || !block.script?.length) continue;
        triggers.push({
          player: pokemon.owner,
          sourceName: `${pokemon.card.name} (${talent.name})`,
          sourceCell: cell,
          trainerCard: null,
          blocks: block.script,
          index: 0,
          stage: 'run',
          chosenCells: [],
          turnId: options.turnId,
        });
      }
    }

    if (triggers.length > 0) {
      setPendingScript((current: PendingScript | null) => triggers.reduce<PendingScript | null>(appendScript, current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  // Talents passifs « script » : leurs effets suivent le plateau tout seuls.
  useEffect(() => {
    const synced = syncAuraModifiers(board);
    if (synced) setBoard(synced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  // Déclencheur whenDamaged : un Pokémon vient d'attaquer et des Pokémon adverses
  // ont perdu des PV dans le même coup.
  const previousBoardRef = useRef<BoardState>(board);
  useEffect(() => {
    const previous = previousBoardRef.current;
    previousBoardRef.current = board;
    if (previous === board) return;
    if (options.triggersActive === false || options.ignoreTriggerBoardRef?.current === board) return;

    const attackerCell = Object.keys(board).find((cell) => {
      const before = previous[cell];
      const after = board[cell];
      return (
        !!before &&
        !!after &&
        before.card.id === after.card.id &&
        !before.hasAttacked &&
        after.hasAttacked &&
        after.owner === options.currentPlayer
      );
    });
    if (!attackerCell) return;

    const attacker = board[attackerCell];
    const triggers: PendingScript[] = [];

    for (const [cell, pokemon] of Object.entries(board)) {
      const before = previous[cell];
      if (
        !pokemon ||
        !before ||
        pokemon.owner === options.currentPlayer ||
        before.card.id !== pokemon.card.id ||
        pokemon.currentHp >= before.currentHp
      ) {
        continue;
      }

      for (const modifier of getActiveModifiers(pokemon)) {
        if (modifier.kind !== 'whenDamaged' || !modifier.script?.length) continue;
        if (modifier.from && (!attacker || !matchesPokemonFilter(attacker, modifier.from, board, attackerCell))) {
          continue;
        }

        triggers.push({
          player: pokemon.owner,
          sourceName: `${pokemon.card.name} (${modifier.sourceName})`,
          sourceCell: cell,
          trainerCard: null,
          blocks: modifier.script,
          index: 0,
          stage: 'run',
          chosenCells: [],
          turnId: options.turnId,
          attackerCell,
        });
      }
    }

    if (triggers.length === 0) return;

    setPendingScript((current: PendingScript | null) => triggers.reduce<PendingScript | null>(appendScript, current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  // ---------------------------------------------------------------
  // CIBLES
  // ---------------------------------------------------------------

  function sidePlayers(script: PendingScript, block: ScriptBlock): Player[] {
    const opponent: Player = script.player === 1 ? 2 : 1;
    const side = block.target?.side ?? getDefaultSide(block);
    return side === 'own' ? [script.player] : side === 'opponent' ? [opponent] : [script.player, opponent];
  }

  /** Actif de la colonne du Pokémon source, pour ce joueur (case de devant d'abord). */
  function activeCellInSourceColumn(working: BoardState, sourceCell: string, player: Player) {
    const column = sourceCell.slice(1);
    const rows = player === 1 ? ['B', 'A'] : ['C', 'D'];
    for (const row of rows) {
      const cell = `${row}${column}`;
      if (working[cell]) return cell;
    }
    return null;
  }

  function matchesFilter(
    script: PendingScript,
    block: ScriptBlock,
    working: BoardState,
    cell: string,
    pokemon: PokemonInPlay
  ): boolean {
    const filter = block.target?.filter;

    if (filter?.excludeSelf && cell === script.sourceCell) return false;
    if (!matchesPokemonFilter(pokemon, filter, working, cell)) return false;

    // Les cartes Dresseur ne ciblent jamais les Invocations.
    if (script.trainerCard && pokemon.isInvocation) return false;

    // Immunité aux effets des attaques (talent / attaque d'un Pokémon adverse).
    const source = script.sourceCell ? working[script.sourceCell] : null;
    if (source && pokemon.owner !== script.player && hasScriptImmunity(pokemon, 'effects', source, working)) {
      return false;
    }

    // Inutile de proposer un Pokémon sur qui l'action ne fait rien.
    if (block.action === 'heal') {
      if (pokemon.currentHp >= getPokemonMaxHp(pokemon) || isHealBlocked(pokemon)) return false;
    }
    if (block.action === 'attachEnergy' && !canAttachEnergyFromSource(pokemon, block.fromDiscard ? 'discard' : 'hand')) {
      return false;
    }
    if (block.action === 'discardEnergy' && pokemon.energies.length === 0) return false;

    // Étape 3
    const hasEnergyToMove = block.energyType
      ? pokemon.energies.includes(block.energyType)
      : pokemon.energies.length > 0;
    if (block.action === 'moveEnergy' && !hasEnergyToMove) return false;
    if (block.action === 'moveDamage' && pokemon.currentHp >= getPokemonMaxHp(pokemon)) return false;
    if ((block.action === 'discardTool' || block.action === 'returnTool') && !pokemon.attachedTool) return false;

    return true;
  }

  /** Une case vide deviendrait-elle l'actif de sa colonne (`ignoreCell` = case qui part) ? */
  function emptyCellIsFront(working: BoardState, cell: string, owner: Player, ignoreCell?: string | null) {
    const column = cell.slice(1);
    for (const row of ROWS[owner]) {
      const other = `${row}${column}`;
      if (other === cell) return true;
      if (other !== ignoreCell && working[other]) return false;
    }
    return false;
  }

  /** Case vide qui respecte `filter.position` ? */
  function emptyCellMatches(
    working: BoardState,
    cell: string,
    owner: Player,
    position: 'active' | 'bench' | undefined,
    ignoreCell?: string | null
  ) {
    if (!position) return true;
    const front = emptyCellIsFront(working, cell, owner, ignoreCell);
    return position === 'active' ? front : !front;
  }

  /**
   * summon : cases vides où le Pokémon peut apparaître.
   * Comme les autres Invocations du jeu : sur la ligne de jeu (B1-B4 / C1-C4).
   */
  function getSummonCells(script: PendingScript, block: ScriptBlock, working: BoardState): string[] {
    const chosen = script.chosenCells ?? [];
    return sidePlayers(script, block).flatMap((player) =>
      [1, 2, 3, 4]
        .map((column) => `${ROWS[player][0]}${column}`)
        .filter((cell) => !working[cell] && !chosen.includes(cell))
    );
  }

  /** Bloc « destination » : la cible devient `to` (camp par défaut selon l'action). */
  function destinationBlock(block: ScriptBlock): ScriptBlock {
    const defaultSide = block.action === 'moveDamage' || block.action === 'swapDamage' ? 'opponent' : 'own';
    return {
      ...block,
      action: 'removeConditions',
      target: { who: 'chosen', ...block.to, side: block.to?.side ?? defaultSide },
    };
  }

  /** Cases d'arrivée possibles pour switch / moveEnergy / moveDamage. */
  function getDestinations(
    script: PendingScript,
    block: ScriptBlock,
    working: BoardState,
    sources: string[]
  ): string[] {
    if (block.action === 'switch') {
      const source = sources[0] ? working[sources[0]] : null;
      if (!source) return [];
      const position = block.to?.anyRow ? block.to?.filter?.position : undefined;

      // Comme Guzma et Corde Sortie : l'échange se fait sur la MÊME LIGNE (d'une colonne à l'autre).
      // to.anyRow: true = n'importe quelle case de son camp.
      const sourceRow = sources[0][0];
      const rows = block.to?.anyRow ? ROWS[source.owner] : [sourceRow];
      // Sur une même ligne, « actif / banc » n'a pas de sens : on ignore `position` dans `to`.
      const destinationFilter =
        block.to?.anyRow || !block.to?.filter ? block.to?.filter : { ...block.to.filter, position: undefined };

      return rows.flatMap((row) =>
        [1, 2, 3, 4]
          .map((column) => `${row}${column}`)
          .filter((cell) => {
            if (cell === sources[0]) return false;
            const other = working[cell];
            if (!other) {
              // Par défaut, on échange seulement avec un Pokémon ;
              // to.emptyCells: true = peut aussi aller sur une case vide.
              if (block.to?.emptyCells !== true) return false;
              return emptyCellMatches(working, cell, source.owner, position, sources[0]);
            }
            return matchesPokemonFilter(other, destinationFilter, working, cell);
          })
      );
    }

    const toBlock = destinationBlock(block);
    return getCandidates(script, toBlock, working).filter((cell) => {
      if (sources.includes(cell)) return false;
      const pokemon = working[cell];
      if (block.action === 'moveEnergy' && pokemon && !canAttachEnergyFromSource(pokemon, 'field')) return false;
      return true;
    });
  }

  /** Cases (ou « joueur-X ») qui peuvent recevoir l'effet. */
  function getCandidates(script: PendingScript, block: ScriptBlock, working: BoardState): string[] {
    const who = block.target?.who ?? 'chosen';
    const players = sidePlayers(script, block);

    if (who === 'player') {
      // Les joueurs ne sont jamais soignés et ne portent pas d'Énergies.
      if (
        block.action !== 'damage' &&
        block.action !== 'counters' &&
        block.action !== 'condition' &&
        block.action !== 'prevent'
      ) {
        return [];
      }
      return players.map(PLAYER_TARGET);
    }

    if (who === 'attacker') {
      const cell = script.attackerCell;
      const attacker = cell ? working[cell] : null;
      return cell && attacker && matchesFilter(script, block, working, cell, attacker) ? [cell] : [];
    }

    if (who === 'self') {
      const self = script.sourceCell ? working[script.sourceCell] : null;
      return self && script.sourceCell && matchesFilter(script, block, working, script.sourceCell, self)
        ? [script.sourceCell]
        : [];
    }

    if (who === 'active' && script.sourceCell) {
      // Sur ce plateau, quand la colonne est vide, c'est le JOUEUR qui fait office d'actif
      // (dégâts, marqueurs et états spéciaux seulement, et sans contrainte `filter`).
      const playerCanBeHit =
        (block.action === 'damage' || block.action === 'counters' || block.action === 'condition') &&
        !block.target?.filter;

      return players.flatMap((player) => {
        const cell = activeCellInSourceColumn(working, script.sourceCell!, player);
        const pokemon = cell ? working[cell] : null;
        if (cell && pokemon) return matchesFilter(script, block, working, cell, pokemon) ? [cell] : [];
        return playerCanBeHit ? [PLAYER_TARGET(player)] : [];
      });
    }

    return Object.entries(working)
      .filter(([cell, pokemon]) => {
        if (!pokemon || !players.includes(pokemon.owner)) return false;
        // 'active' sans Pokémon source (carte Dresseur) : un Pokémon actif au choix.
        if (who === 'active' && !isActivePokemonCell(working, cell)) return false;
        return matchesFilter(script, block, working, cell, pokemon);
      })
      .map(([cell]) => cell);
  }

  // ---------------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------------

  /** Met le Pokémon K.O. : pénalité, cartes et Énergies à la défausse. */
  function knockOut(working: BoardState, cell: string, pokemon: PokemonInPlay): number {
    const penalty = getKOPenalty(pokemon.card.stage, pokemon.card.variant);
    const discarded: GameCard[] = [pokemon.card, ...(pokemon.attachedTool ? [pokemon.attachedTool] : [])];

    working[cell] = null;
    options.prepareKOEnergyMove(pokemon, working);

    if (pokemon.owner === 1) {
      options.setPlayer1Damage((damage) => damage + penalty);
      options.setPlayer1Discard((discard) => [...discard, ...discarded]);
      options.setPlayer1DiscardEnergies((discard) => [...discard, ...pokemon.energies]);
    } else {
      options.setPlayer2Damage((damage) => damage + penalty);
      options.setPlayer2Discard((discard) => [...discard, ...discarded]);
      options.setPlayer2DiscardEnergies((discard) => [...discard, ...pokemon.energies]);
    }

    return penalty;
  }

  /** Applique le bloc sur une cible ; renvoie le texte du résultat. */
  function applyBlock(
    script: PendingScript,
    block: ScriptBlock,
    working: BoardState,
    targetKey: string,
    multiplier: number
  ): string {
    const amount = (block.amount ?? (block.action === 'attachEnergy' || block.action === 'discardEnergy' ? 1 : 0)) * multiplier;

    // --- Le joueur ---
    if (targetKey.startsWith('joueur-')) {
      const targetPlayer = Number(targetKey.slice(7)) as Player;

      if (block.action === 'damage' || block.action === 'counters') {
        const total = block.action === 'counters' ? amount * 10 : amount;
        (targetPlayer === 1 ? options.setPlayer1Damage : options.setPlayer2Damage)(
          (damage: number) => damage + total
        );
        return block.action === 'counters'
          ? `${amount} marqueur(s) sur le joueur ${targetPlayer}`
          : `le joueur ${targetPlayer} subit ${total} dégâts`;
      }

      if (block.action === 'condition') {
        (targetPlayer === 1 ? options.setPlayer1Status : options.setPlayer2Status)((status) =>
          applySpecialConditionsToPlayer(status, block.conditions ?? [], script.player, block.poisonCounters)
        );
        return `le joueur ${targetPlayer} est affecté (${(block.conditions ?? []).join(', ')})`;
      }

      if (block.action === 'prevent') {
        const modifier = createScriptModifier(block, script.sourceName, script.player, options.currentPlayer);
        if (!modifier) return '';
        (targetPlayer === 1 ? options.setPlayer1Status : options.setPlayer2Status)((status: PlayerStatusState) => ({
          ...status,
          scriptModifiers: [...(status.scriptModifiers ?? []), modifier],
        }));
        return `joueur ${targetPlayer} : ${describeModifier(modifier)}`;
      }

      return '';
    }

    // ----- Étape 3 : apparition sur une case vide -----
    if (block.action === 'summon') {
      if (working[targetKey]) return '';

      // `pokemon` : les Invocations choisies à la préparation pour cette carte ;
      // sinon le Pokémon `pokemonName`.
      let card = block.pokemonName ? findPokemonCardByName(block.pokemonName, options.cardSeries) : null;

      if (!block.pokemonName && block.pokemon) {
        const summonerCard =
          script.trainerCard ?? (script.sourceCell ? working[script.sourceCell]?.card : null) ?? null;
        const choices = script.player === 1 ? options.player1SummonChoices : options.player2SummonChoices;
        const chosen = summonerCard ? pokemonOnly(choices[baseCardId(summonerCard.id)]) : [];
        const position = Math.max(0, (script.chosenCells ?? []).indexOf(targetKey));
        card = chosen.length > 0 ? chosen[position % chosen.length] : null;
        if (!card) return `${script.sourceName} : aucune Invocation choisie à la préparation`;
      }

      if (!card) {
        return block.pokemonName
          ? `${script.sourceName} : Pokémon « ${block.pokemonName} » introuvable`
          : '';
      }

      const owner: Player = ROWS[1].includes(targetKey[0]) ? 1 : 2;
      const opponent: Player = owner === 1 ? 2 : 1;
      const energyCount = block.amount ?? 0;
      const energyType: EnergyType =
        block.energyType ?? (card.type === 'dragon' ? (card.dragonEnergyTypes?.[0] ?? 'normal') : card.type);

      // Mêmes règles de pose que les autres Invocations :
      // talent de protection à la pose (s'il n'est pas annulé), puis dégâts de pose adverses.
      const onPlayCard = isTalentNegatedAt(working, targetKey, owner, card) ? { ...card, talent: undefined } : card;
      const protectedOnPlay =
        onPlayCard.talent?.type === 'passive' &&
        onPlayCard.talent.effect === 'preventAllAttackDamageAndEffectsOnPlayUntilOpponentTurnEnd';

      const summoned: PokemonInPlay = {
        ...createPokemonInPlay({
          card,
          owner,
          energies: Array(energyCount).fill(energyType),
          isInvocation: block.invocation !== false,
        }),
        preventAllAttackDamageAndEffects: protectedOnPlay,
        preventAllAttackDamageAndEffectsEndPlayer: protectedOnPlay ? opponent : null,
      };

      const placementDamage = getOpponentPlacementDamage(working, owner);
      const placed: PokemonInPlay = { ...summoned, currentHp: summoned.currentHp - placementDamage };

      if (placed.currentHp <= 0) {
        working[targetKey] = placed;
        const penalty = knockOut(working, targetKey, placed);
        return `${card.name} apparaît en ${targetKey}, subit ${placementDamage} dégâts et est K.O. (+${penalty} au joueur ${owner})`;
      }

      working[targetKey] = placed;
      return placementDamage > 0
        ? `${card.name} apparaît en ${targetKey} et subit ${placementDamage} dégâts`
        : `${card.name} apparaît en ${targetKey}`;
    }

    const pokemon = working[targetKey];
    if (!pokemon) return '';

    // ----- Attaque interdite (blockAttack) -----
    if (block.action === 'blockAttack') {
      const attackName = block.attackName ?? script.chosenAttack ?? null;
      if (!attackName) return '';
      const modifier = createScriptModifier(
        { ...block, action: 'prevent', prevent: ['attack'], attackName },
        script.sourceName,
        script.player,
        options.currentPlayer
      );
      if (!modifier) return '';
      working[targetKey] = { ...pokemon, scriptModifiers: [...(pokemon.scriptModifiers ?? []), modifier] };
      return `${pokemon.card.name} ne pourra pas utiliser ${attackName}`;
    }

    // ----- Étape 2 : effets qui durent -----
    if (isModifierAction(block.action)) {
      const modifier = createScriptModifier(
        {
          ...block,
          amount: block.amount === undefined ? undefined : amount,
          // prevent + chooseAttack : seulement l'attaque choisie
          attackName: block.chooseAttack ? (block.attackName ?? script.chosenAttack ?? undefined) : block.attackName,
        },
        script.sourceName,
        script.player,
        options.currentPlayer
      );
      if (!modifier) return '';

      const before = getScriptMaxHpBonus(pokemon);
      let updated: PokemonInPlay = {
        ...pokemon,
        scriptModifiers: [...(pokemon.scriptModifiers ?? []), modifier],
      };
      // PV max : les dégâts déjà subis restent, les PV restants suivent.
      const hpDelta = getScriptMaxHpBonus(updated) - before;
      if (hpDelta !== 0) updated = { ...updated, currentHp: updated.currentHp + hpDelta };

      if (updated.currentHp <= 0) {
        const penalty = knockOut(working, targetKey, updated);
        return `${pokemon.card.name} : ${describeModifier(modifier)}, il est K.O. (+${penalty} au joueur ${pokemon.owner})`;
      }

      working[targetKey] = updated;
      const later = modifier.startsIn > 0 ? ' (au prochain tour concerné)' : '';
      return `${pokemon.card.name} : ${describeModifier(modifier)}${later}`;
    }

    switch (block.action) {
      case 'heal': {
        const healed = Math.min(amount, getPokemonMaxHp(pokemon) - pokemon.currentHp);
        working[targetKey] = { ...pokemon, currentHp: pokemon.currentHp + healed };
        return `${pokemon.card.name} récupère ${healed} PV`;
      }

      case 'damage':
      case 'counters': {
        // Marqueurs : `amount` marqueurs = amount × 10, rien ne les réduit.
        let dealt = block.action === 'counters' ? amount * 10 : amount;

        // Dégâts venant d'un Pokémon ADVERSE : immunités, résistances et talents de réduction.
        const source = script.sourceCell ? working[script.sourceCell] : null;
        if (block.action === 'damage' && source && source.owner !== pokemon.owner) {
          if (pokemon.preventAllAttackDamageAndEffects || hasScriptImmunity(pokemon, 'damage', source, working)) {
            return `${pokemon.card.name} ne subit aucun dégât (protégé)`;
          }
          dealt = Math.max(0, dealt - getTalentDamageReduction(pokemon, source, working));
        }

        if (dealt <= 0) return `${pokemon.card.name} ne subit aucun dégât`;

        const what = block.action === 'counters' ? `${dealt / 10} marqueur(s)` : `${dealt} dégâts`;
        const hpAfter = pokemon.currentHp - dealt;

        if (hpAfter > 0) {
          working[targetKey] = { ...pokemon, currentHp: hpAfter };
          return `${pokemon.card.name} reçoit ${what}`;
        }

        // K.O. : pénalité, cartes et Énergies à la défausse.
        const penalty = knockOut(working, targetKey, pokemon);

        return `${pokemon.card.name} reçoit ${what} et est K.O. (+${penalty} au joueur ${pokemon.owner})`;
      }

      case 'attachEnergy': {
        const energyType: EnergyType =
          block.energyType ??
          (pokemon.card.type === 'dragon'
            ? (pokemon.card.dragonEnergyTypes?.[0] ?? 'normal')
            : pokemon.card.type);

        // Étape 3 : Énergies reprises dans la pile de défausse du joueur.
        if (block.fromDiscard) {
          const pool = discardEnergyPool[script.player];
          const taken: EnergyType[] = [];
          for (let index = pool.length - 1; index >= 0 && taken.length < amount; index -= 1) {
            if (!block.energyType || pool[index] === block.energyType) {
              taken.push(...pool.splice(index, 1));
            }
          }
          if (taken.length === 0) return `${script.sourceName} : aucune Énergie à reprendre dans la défausse`;

          (script.player === 1 ? options.setPlayer1DiscardEnergies : options.setPlayer2DiscardEnergies)(
            (discard: EnergyType[]) => removeEnergies(discard, taken)
          );
          working[targetKey] = { ...pokemon, energies: [...pokemon.energies, ...taken] };
          return `${pokemon.card.name} reçoit ${taken.length} Énergie(s) de la défausse`;
        }

        working[targetKey] = {
          ...pokemon,
          energies: [...pokemon.energies, ...Array(amount).fill(energyType)],
        };
        return `${pokemon.card.name} reçoit ${amount} Énergie(s) ${energyType}`;
      }

      case 'discardEnergy': {
        const energies = [...pokemon.energies];
        const removed: EnergyType[] = [];

        for (let index = energies.length - 1; index >= 0 && removed.length < amount; index -= 1) {
          if (!block.energyType || energies[index] === block.energyType) {
            removed.push(...energies.splice(index, 1));
          }
        }

        working[targetKey] = { ...pokemon, energies };
        (pokemon.owner === 1 ? options.setPlayer1DiscardEnergies : options.setPlayer2DiscardEnergies)(
          (discard) => [...discard, ...removed]
        );
        return `${pokemon.card.name} défausse ${removed.length} Énergie(s)`;
      }

      case 'condition': {
        working[targetKey] = applySpecialConditions(
          pokemon,
          block.conditions ?? [],
          script.player,
          block.poisonCounters
        );
        return `${pokemon.card.name} est affecté (${(block.conditions ?? []).join(', ')})`;
      }

      case 'removeConditions': {
        working[targetKey] = {
          ...pokemon,
          poisoned: false,
          poisonSourcePlayer: null,
          poisonCounters: undefined,
          burned: false,
          burnSourcePlayer: null,
          burnTriggersRemaining: 0,
          paralyzed: false,
          paralysisTurnsRemaining: 0,
          confused: false,
          confusionTurnsRemaining: 0,
          asleep: false,
          sleepSourcePlayer: null,
          sleepEndPlayer: null,
        };
        return `${pokemon.card.name} n'a plus d'état spécial`;
      }

      // ----- Étape 3 -----
      case 'returnToHand': {
        working[targetKey] = null;

        // Les Énergies vont à la défausse.
        (pokemon.owner === 1 ? options.setPlayer1DiscardEnergies : options.setPlayer2DiscardEnergies)(
          (discard: EnergyType[]) => [...discard, ...pokemon.energies]
        );

        // Une Invocation n'a pas de carte en main : elle disparaît.
        if (pokemon.isInvocation) {
          if (pokemon.attachedTool) {
            (pokemon.owner === 1 ? options.setPlayer1Hand : options.setPlayer2Hand)((hand: GameCard[]) => [
              ...hand,
              pokemon.attachedTool!,
            ]);
          }
          return `${pokemon.card.name} (Invocation) quitte le plateau`;
        }

        (pokemon.owner === 1 ? options.setPlayer1Hand : options.setPlayer2Hand)((hand: GameCard[]) => [
          ...hand,
          pokemon.card,
          ...(pokemon.attachedTool ? [pokemon.attachedTool] : []),
        ]);
        return `${pokemon.card.name} retourne dans la main`;
      }

      case 'discardTool':
      case 'returnTool': {
        const tool = pokemon.attachedTool;
        if (!tool) return '';

        const withoutTool: PokemonInPlay = { ...pokemon, attachedTool: null };
        const lostMaxHp = Math.max(0, getPokemonMaxHp(pokemon) - getPokemonMaxHp(withoutTool));
        const updated: PokemonInPlay = { ...withoutTool, currentHp: withoutTool.currentHp - lostMaxHp };

        if (block.action === 'discardTool') {
          (pokemon.owner === 1 ? options.setPlayer1Discard : options.setPlayer2Discard)((discard: GameCard[]) => [
            ...discard,
            tool,
          ]);
        } else {
          (pokemon.owner === 1 ? options.setPlayer1Hand : options.setPlayer2Hand)((hand: GameCard[]) => [
            ...hand,
            tool,
          ]);
        }

        const verb = block.action === 'discardTool' ? 'est défaussé' : 'retourne dans la main';
        if (updated.currentHp <= 0) {
          const penalty = knockOut(working, targetKey, updated);
          return `${tool.name} ${verb}, ${pokemon.card.name} est K.O. (+${penalty} au joueur ${pokemon.owner})`;
        }
        working[targetKey] = updated;
        return `${tool.name} de ${pokemon.card.name} ${verb}`;
      }

      default:
        return '';
    }
  }

  /** switch / moveEnergy / moveDamage : de `sourceCell` vers `toCell`. */
  function applyMove(
    block: ScriptBlock,
    working: BoardState,
    sourceCell: string,
    toCell: string,
    multiplier: number
  ): string {
    const source = working[sourceCell];
    if (!source) return '';
    const destination = working[toCell];

    if (block.action === 'switch') {
      working[toCell] = source;
      working[sourceCell] = destination ?? null;
      return destination
        ? `${source.card.name} et ${destination.card.name} échangent leur place`
        : `${source.card.name} se déplace en ${toCell}`;
    }

    if (!destination) return '';

    if (block.action === 'moveEnergy') {
      const wanted = (block.amount ?? 1) * multiplier;
      const energies = [...source.energies];
      const moved: EnergyType[] = [];
      for (let index = energies.length - 1; index >= 0 && moved.length < wanted; index -= 1) {
        if (!block.energyType || energies[index] === block.energyType) {
          moved.push(...energies.splice(index, 1));
        }
      }
      working[sourceCell] = { ...source, energies };
      working[toCell] = { ...destination, energies: [...destination.energies, ...moved] };
      return `${moved.length} Énergie(s) passent de ${source.card.name} à ${destination.card.name}`;
    }

    if (block.action === 'swapDamage') {
      const sourceDamage = Math.max(0, getPokemonMaxHp(source) - source.currentHp);
      const destinationDamage = Math.max(0, getPokemonMaxHp(destination) - destination.currentHp);
      const newSource: PokemonInPlay = { ...source, currentHp: getPokemonMaxHp(source) - destinationDamage };
      const newDestination: PokemonInPlay = {
        ...destination,
        currentHp: getPokemonMaxHp(destination) - sourceDamage,
      };
      const texts = [`${source.card.name} et ${destination.card.name} échangent leurs dégâts`];

      for (const [cell, pokemon] of [
        [sourceCell, newSource],
        [toCell, newDestination],
      ] as const) {
        if (pokemon.currentHp <= 0) {
          const penalty = knockOut(working, cell, pokemon);
          texts.push(`${pokemon.card.name} est K.O. (+${penalty} au joueur ${pokemon.owner})`);
        } else {
          working[cell] = pokemon;
        }
      }
      return texts.join(', ');
    }

    if (block.action === 'moveDamage') {
      const wanted = (block.amount ?? 10) * multiplier;
      const damageOnSource = Math.max(0, getPokemonMaxHp(source) - source.currentHp);
      const moved = Math.min(wanted, damageOnSource);
      if (moved <= 0) return '';

      working[sourceCell] = { ...source, currentHp: source.currentHp + moved };
      const hit: PokemonInPlay = { ...destination, currentHp: destination.currentHp - moved };

      if (hit.currentHp <= 0) {
        const penalty = knockOut(working, toCell, hit);
        return `${moved} dégâts passent de ${source.card.name} à ${destination.card.name}, qui est K.O. (+${penalty} au joueur ${destination.owner})`;
      }
      working[toCell] = hit;
      return `${moved} dégâts passent de ${source.card.name} à ${destination.card.name}`;
    }

    return '';
  }

  // ---------------------------------------------------------------
  // DÉROULEMENT
  // ---------------------------------------------------------------

  function describeBlockTarget(block: ScriptBlock): string {
    const side = block.target?.side ?? getDefaultSide(block);
    const whose = side === 'own' ? 'un de tes Pokémon' : side === 'opponent' ? 'un Pokémon adverse' : 'un Pokémon';
    return whose;
  }

  // Énergies de la défausse encore disponibles pendant ce passage (attachEnergy fromDiscard).
  let discardEnergyPool: Record<Player, EnergyType[]> = { 1: [], 2: [] };

  /** recoverCards : cartes de SA défausse qu'on peut encore reprendre. */
  function getScriptCardChoices(script: PendingScript | null): GameCard[] {
    if (!script || script.stage !== 'card') return [];
    const block = script.blocks[script.index];
    const discard = script.player === 1 ? options.player1Discard : options.player2Discard;
    return getRecoverableCards(discard, block?.cards).map(({ card }) => card);
  }

  /** Avance le script jusqu'à la fin, ou jusqu'à ce qu'il attende le joueur. */
  function runScript(start: PendingScript) {
    const working: BoardState = { ...board };
    discardEnergyPool = {
      1: [...options.player1DiscardEnergies],
      2: [...options.player2DiscardEnergies],
    };
    const texts: string[] = [];
    let script: PendingScript = { ...start };

    const finishBlock = () => {
      script = {
        ...script,
        index: script.index + 1,
        optionalAnswer: undefined,
        coinKey: undefined,
        // on garde le dernier lancer (coin.useLastFlip)
        lastCoinResult: script.coinResult ?? script.lastCoinResult ?? null,
        coinResult: null,
        chosenCells: [],
        toCell: null,
        pickedCards: 0,
        chosenAttack: null,
        chooser: null,
      };
    };

    const pause = (next: PendingScript, question: string) => {
      setBoard(working);
      // Le choix d'une cible / d'une destination peut revenir à l'adversaire (chooser: 'opponent').
      const block = next.blocks[next.index];
      const wantsOpponent =
        (next.stage === 'target' && block?.target?.chooser === 'opponent') ||
        (next.stage === 'destination' && (block?.to?.chooser ?? block?.target?.chooser) === 'opponent');
      setPendingScript({ ...next, chooser: wantsOpponent ? (next.player === 1 ? 2 : 1) : null });
      const actor = wantsOpponent ? (next.player === 1 ? 2 : 1) : next.player;
      if (wantsOpponent) question = `Joueur ${actor} : ${question}`;
      setMessage([...texts, question].filter(Boolean).join(' • '));
    };

    // Contexte pour compter (`per`, `if`).
    const countContext = () => ({
      board: working,
      player: script.player,
      sourceCell: script.sourceCell,
      player1Discard: options.player1Discard,
      player2Discard: options.player2Discard,
      player1Hand: options.player1Hand,
      player2Hand: options.player2Hand,
      player1DiscardEnergies: options.player1DiscardEnergies,
      player2DiscardEnergies: options.player2DiscardEnergies,
    });

    while (script.index < script.blocks.length) {
      const block = script.blocks[script.index];

      // 0) Condition « si … » (vérifiée avant toute question ou pièce)
      if (
        block.if &&
        script.optionalAnswer === undefined &&
        !script.coinResult &&
        !isScriptConditionMet(block.if, countContext())
      ) {
        finishBlock();
        continue;
      }

      // 1) Question OUI / NON
      if (block.optional && script.optionalAnswer === undefined) {
        const question =
          typeof block.optional === 'string'
            ? block.optional
            : `${script.sourceName} : appliquer l'effet ?`;
        pause({ ...script, stage: 'optional' }, question);
        return;
      }
      if (block.optional && script.optionalAnswer === false) {
        finishBlock();
        continue;
      }

      // Dégâts de l'attaque en plus : déjà comptés avec les dégâts de l'attaque.
      if (
        block.action === 'attackDamage' ||
        block.action === 'attackFails' ||
        block.action === 'attackIgnoresReductions'
      ) {
        finishBlock();
        continue;
      }

      // Fin du tour demandée : elle aura lieu quand le script sera terminé.
      if (block.action === 'endTurn') {
        script = { ...script, endTurnAfter: true };
        finishBlock();
        continue;
      }

      // 2) Pièces
      let multiplier = 1;
      if (block.coin) {
        const count = block.coin.count ?? 1;

        // « sinon » : on reprend le dernier lancer au lieu de relancer.
        if (!script.coinResult && block.coin.useLastFlip && script.lastCoinResult) {
          script = { ...script, coinResult: script.lastCoinResult };
        }

        if (!script.coinResult) {
          if (script.sourceCell && working[script.sourceCell]) {
            options.startPokemonCoinFlip(script.sourceCell, count);
            pause({ ...script, stage: 'coin', coinKey: script.sourceCell }, '');
          } else if (script.trainerCard) {
            options.startTrainerCoinFlip(script.trainerCard, script.player, count);
            pause({ ...script, stage: 'coin', coinKey: script.trainerCard.id }, '');
          } else {
            finishBlock();
            continue;
          }
          return;
        }

        const flipped = script.coinResult.length;
        const faces = script.coinResult.filter((side) => side === 'face').length;
        const tails = flipped - faces;
        const need = block.coin.need ?? 'face';
        const success =
          need === 'allFace'
            ? faces === flipped
            : need === 'tails' || need === 'perTails'
              ? tails > 0
              : need === 'allTails'
                ? tails === flipped
                : faces > 0;

        if (!success) {
          const side = need.toLowerCase().includes('tails') ? 'PILE' : 'FACE';
          texts.push(`${script.sourceName} : pas assez de ${side}, l'effet ne s'applique pas`);
          finishBlock();
          continue;
        }
        if (need === 'perFace') multiplier = faces;
        if (need === 'perTails') multiplier = tails;
      }

      // 2 bis) « Pour chaque … » (`per`)
      if (block.per) {
        const count = computeScriptCount(block.per, countContext());
        if (count <= 0) {
          texts.push(`${script.sourceName} : rien à compter, l'effet ne s'applique pas`);
          finishBlock();
          continue;
        }
        multiplier *= count;
      }

      // 2 bis) Invocation d'une carte Dresseur (kind 'supporter' / 'objet' / 'outil') : dans la MAIN
      if (block.action === 'summon' && block.kind && block.kind !== 'pokemon') {
        const summonerCard =
          script.trainerCard ?? (script.sourceCell ? working[script.sourceCell]?.card : null) ?? null;
        const choices = script.player === 1 ? options.player1SummonChoices : options.player2SummonChoices;
        const chosen = (summonerCard ? (choices[baseCardId(summonerCard.id)] ?? []) : []).filter(
          (card) => !isPokemonCard(card)
        );

        if (chosen.length === 0) {
          texts.push(`${script.sourceName} : aucune carte choisie à la préparation`);
        } else {
          const wanted = Math.max(1, (block.target?.count ?? chosen.length) * multiplier);
          // Chaque copie invoquée a son propre identifiant (sinon, jouer l'une retirerait aussi
          // une carte identique déjà en main). Identique sur les deux écrans en ligne.
          const cards = Array.from({ length: wanted }, (_, index) => {
            const card = chosen[index % chosen.length];
            return { ...card, id: `${baseCardId(card.id)}~inv${options.turnId}-${script.index}-${index}` };
          });
          (script.player === 1 ? options.setPlayer1Hand : options.setPlayer2Hand)((hand: GameCard[]) => [
            ...hand,
            ...cards,
          ]);
          texts.push(`${script.sourceName} : ${cards.map((card) => card.name).join(', ')} arrive(nt) dans la main`);
        }
        finishBlock();
        continue;
      }

      // 2 bis) Étape 3 : reprendre des cartes de sa défausse (choix dans un panneau)
      if (block.action === 'recoverCards') {
        const wanted = Math.max(1, (block.amount ?? 1) * multiplier);
        const picked = script.pickedCards ?? 0;
        const discard = script.player === 1 ? options.player1Discard : options.player2Discard;
        const available = getRecoverableCards(discard, block.cards);

        if (picked < wanted && available.length > 0) {
          pause(
            { ...script, stage: 'card', pickedCards: picked },
            `${script.sourceName} : choisis une carte de ta défausse (${picked + 1}/${wanted}).`
          );
          return;
        }
        if (picked === 0) texts.push(`${script.sourceName} : aucune carte à reprendre dans la défausse`);
        finishBlock();
        continue;
      }

      // 3) Cibles
      const who = block.target?.who ?? 'chosen';
      const candidates =
        block.action === 'summon' ? getSummonCells(script, block, working) : getCandidates(script, block, working);
      let targets: string[];

      const mustChoose =
        block.action === 'summon' || who === 'chosen' || (who === 'active' && !script.sourceCell);
      if (mustChoose) {
        const needed = Math.max(1, block.target?.count ?? 1);
        const chosen = script.chosenCells ?? [];
        const remaining = candidates.filter((cell) => !chosen.includes(cell));
        if (chosen.length < needed && remaining.length > 0) {
          pause(
            { ...script, stage: 'target', chosenCells: chosen },
            `${script.sourceName} : choisis ${describeBlockTarget(block)} (${chosen.length + 1}/${needed}).`
          );
          return;
        }
        targets = chosen;
      } else {
        targets = candidates;
      }

      if (targets.length === 0) {
        texts.push(`${script.sourceName} : aucune cible possible`);
      }

      // 3 bis) Étape 3 : case d'arrivée (switch, moveEnergy, moveDamage)
      if (DESTINATION_ACTIONS.includes(block.action) && targets.length > 0) {
        let toCell = script.toCell ?? null;

        if (!toCell) {
          const destinations = getDestinations(script, block, working, targets);
          const toWho = block.to?.who ?? 'chosen';

          if (destinations.length === 0) {
            texts.push(`${script.sourceName} : aucune case d'arrivée possible`);
            finishBlock();
            continue;
          }
          if (toWho === 'chosen' || block.action === 'switch') {
            pause(
              { ...script, stage: 'destination', chosenCells: targets },
              block.action === 'switch'
                ? `${script.sourceName} : choisis où déplacer ${working[targets[0]]?.card.name ?? 'le Pokémon'}.`
                : `${script.sourceName} : choisis le Pokémon qui reçoit.`
            );
            return;
          }
          toCell = destinations[0];
        }

        for (const target of targets) {
          const text = applyMove(block, working, target, toCell, multiplier);
          if (text) texts.push(text);
        }
        finishBlock();
        continue;
      }

      // 3 ter) blockAttack : choisir l'attaque du Pokémon ciblé
      const choosesAttack =
        block.action === 'blockAttack' ||
        (block.action === 'prevent' && block.chooseAttack === true && (block.prevent ?? []).includes('attack'));
      if (choosesAttack && !block.attackName && !script.chosenAttack && targets.length > 0) {
        const attacks = working[targets[0]]?.card.attacks ?? [];
        if (attacks.length === 0) {
          texts.push(`${script.sourceName} : ce Pokémon n'a pas d'attaque`);
          finishBlock();
          continue;
        }
        if (attacks.length > 1) {
          pause(
            { ...script, stage: 'attack', chosenCells: targets },
            `${script.sourceName} : choisis l'attaque de ${working[targets[0]]?.card.name} à bloquer.`
          );
          return;
        }
        script = { ...script, chosenAttack: attacks[0].name };
      }

      // 4) Effet
      for (const target of targets) {
        const text = applyBlock(script, block, working, target, multiplier);
        if (text) texts.push(text);
      }

      finishBlock();
    }

    // Fin du script (puis le suivant de la file d'attente, s'il y en a un)
    setBoard(working);
    setPendingScript(script.then ?? null);
    if (script.endTurnAfter) setEndTurnRequested(true);
    if (texts.length > 0) setMessage(texts.join(' • '));
  }

  // ---------------------------------------------------------------
  // RÉPONSES DU JOUEUR
  // ---------------------------------------------------------------

  /** Panneau OUI / NON. */
  function answerScriptOptional(accept: boolean) {
    if (!pendingScript || pendingScript.stage !== 'optional') return;
    setPendingScript({ ...pendingScript, stage: 'run', optionalAnswer: accept });
  }

  /** Clic sur le plateau pendant un choix de cible. */
  function handleScriptCellPress(cellName: string): boolean {
    if (!pendingScript) return false;

    const block = pendingScript.blocks[pendingScript.index];
    const chosen = pendingScript.chosenCells ?? [];

    // Étape 3 : choix de la case d'arrivée.
    if (pendingScript.stage === 'destination') {
      const destinations = getDestinations(pendingScript, block, board, chosen);
      if (!destinations.includes(cellName)) {
        setMessage(`${pendingScript.sourceName} : cette case ne peut pas être choisie.`);
        return true;
      }
      setPendingScript({ ...pendingScript, stage: 'run', toCell: cellName });
      return true;
    }

    // Le script attend autre chose (pièce, OUI / NON, carte) : on bloque les clics.
    if (pendingScript.stage !== 'target') {
      setMessage(`${pendingScript.sourceName} : termine d'abord l'effet en cours.`);
      return true;
    }

    const candidates =
      block.action === 'summon'
        ? getSummonCells(pendingScript, block, board)
        : getCandidates(pendingScript, block, board);

    if (!candidates.includes(cellName) || chosen.includes(cellName)) {
      setMessage(
        `${pendingScript.sourceName} : ${block.action === 'summon' ? 'cette case' : 'ce Pokémon'} ne peut pas être choisi.`
      );
      return true;
    }

    setPendingScript({ ...pendingScript, stage: 'run', chosenCells: [...chosen, cellName] });
    return true;
  }

  /**
   * recoverCards : `index` = place de la carte dans la liste proposée
   * (getScriptCardChoices) ; -1 = arrêter de reprendre des cartes.
   */
  function answerScriptCard(index: number) {
    // blockAttack : `index` = place de l'attaque dans la liste.
    if (pendingScript?.stage === 'attack') {
      const attackName = getScriptAttackChoices(pendingScript)[index];
      if (!attackName) return;
      setPendingScript({ ...pendingScript, stage: 'run', chosenAttack: attackName });
      return;
    }

    if (!pendingScript || pendingScript.stage !== 'card') return;
    const block = pendingScript.blocks[pendingScript.index];
    const picked = pendingScript.pickedCards ?? 0;


    if (index < 0) {
      // Fin du choix : on passe au bloc suivant.
      setPendingScript({ ...pendingScript, stage: 'run', pickedCards: Number.MAX_SAFE_INTEGER });
      return;
    }

    const player = pendingScript.player;
    const discard = player === 1 ? options.player1Discard : options.player2Discard;
    const entry = getRecoverableCards(discard, block?.cards)[index];
    if (!entry) return;

    (player === 1 ? options.setPlayer1Discard : options.setPlayer2Discard)((current: GameCard[]) =>
      current.filter((_, position) => position !== entry.index)
    );
    (player === 1 ? options.setPlayer1Hand : options.setPlayer2Hand)((hand: GameCard[]) => [...hand, entry.card]);
    setMessage(`${pendingScript.sourceName} : ${entry.card.name} retourne dans la main.`);
    setPendingScript({ ...pendingScript, stage: 'run', pickedCards: picked + 1 });
  }

  /** blockAttack : noms des attaques du Pokémon ciblé. */
  function getScriptAttackChoices(script: PendingScript | null): string[] {
    if (!script || script.stage !== 'attack') return [];
    const cell = script.chosenCells?.[0];
    const pokemon = cell ? board[cell] : null;
    return pokemon?.card.attacks.map((attack) => attack.name) ?? [];
  }

  return {
    answerScriptOptional,
    answerScriptCard,
    scriptAttackChoices: getScriptAttackChoices(pendingScript),
    handleScriptCellPress,
    scriptCardChoices: getScriptCardChoices(pendingScript),
  };
}
