import { useEffect, useRef, useState } from 'react';

import type { TutorialPanelInfo } from '@/features/game/components/panels/tutorial-panel';
import { ALL_SERIES_POKEMON_CARDS, ALL_SERIES_TRAINER_CARDS } from '@/features/game/data';

import type { GameApi } from '@/features/game/hooks/use-game';
import { getSummonChoiceEffect, isPokemonCard } from '@/features/game/rules';
import type { GameCard, Player, PokemonCard } from '@/features/game/types';

import { useOpponentAI } from './use-opponent-ai';

// =====================================================================
// PARTIE LIBRE CONTRE L'ORDINATEUR
//   - « test en autonomie » : decks du didacticiel, le joueur fait ce qu'il veut ;
//   - « entraînement » : le joueur choisit son deck, l'ordinateur garde le deck
//     du test en autonomie (ou un deck au hasard si on ne lui en donne pas).
// Dans les deux cas, toutes les règles d'une vraie partie s'appliquent.
// =====================================================================

export type FreePlayMode =
  | { kind: 'autonomie'; playerDeck: string[]; opponentDeck: string[]; intro?: string[] }
  | { kind: 'entrainement'; opponentDeck?: string[] };

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

const isGxOrEx = (card: PokemonCard) =>
  card.variant === 'gx' || card.variant === 'ex' || card.stage === 'mega_ex';

/**
 * Deck de l'ordinateur : 8 Pokémon (au moins 3 de Base, 2 GX/EX au plus),
 * 3 Objets et 2 Supporters, sans les cartes qui demandent de choisir une Invocation.
 */
export function buildAIDeck(game: GameApi): GameCard[] {
  const noSummon = (card: GameCard) => !getSummonChoiceEffect(card) && !('effect' in card && card.effect === 'summonTwoBase60');

  const pokemon = shuffle(game.cardSeries.pokemon.filter(noSummon));
  const chosen: PokemonCard[] = [];
  let gxEx = 0;
  const take = (card: PokemonCard) => {
    if (chosen.length >= 8 || chosen.includes(card)) return;
    if (isGxOrEx(card)) {
      if (gxEx >= 2) return;
      gxEx += 1;
    }
    chosen.push(card);
  };
  pokemon.filter((card) => card.stage === 'base').slice(0, 4).forEach(take);
  pokemon.forEach(take);

  const trainers = shuffle(game.cardSeries.trainers.filter(noSummon));
  const objets = trainers.filter((card) => !isPokemonCard(card) && card.category === 'objet').slice(0, 3);
  const supporters = trainers.filter((card) => !isPokemonCard(card) && card.category === 'supporter').slice(0, 2);

  return [...chosen, ...objets, ...supporters];
}

/**
 * Retrouve les cartes par leur nom : d'abord dans la série de la partie,
 * puis dans toutes les séries (le deck du bot reste le même partout).
 */
function findCardsByName(game: GameApi, names: string[]): GameCard[] {
  const seriesCards: GameCard[] = [...game.cardSeries.pokemon, ...game.cardSeries.trainers];
  const everyCard: GameCard[] = [...ALL_SERIES_POKEMON_CARDS, ...ALL_SERIES_TRAINER_CARDS];
  return names
    .map(
      (name) =>
        seriesCards.find((card) => sameName(card.name, name)) ??
        everyCard.find((card) => sameName(card.name, name))
    )
    .filter((card): card is GameCard => card !== undefined);
}

/** Prépare la partie, fait jouer l'ordinateur et empêche le joueur de jouer à sa place. */
export function useFreePlay(
  rawGame: GameApi,
  mode: FreePlayMode
): { game: GameApi; panel?: TutorialPanelInfo } {
  const gameRef = useRef(rawGame);
  gameRef.current = rawGame;

  // Test en autonomie : decks du didacticiel, combat direct.
  const startedRef = useRef(false);
  useEffect(() => {
    if (mode.kind !== 'autonomie' || startedRef.current) return;
    startedRef.current = true;
    const game = gameRef.current;
    const playerCards = findCardsByName(game, mode.playerDeck);
    const opponentCards = findCardsByName(game, mode.opponentDeck);

    // Vraie partie : toutes les règles de pose s'appliquent.
    game.setNoPlacementRestrictions(false);
    game.setPlayer1SetupCards(playerCards);
    game.setPlayer2SetupCards(opponentCards);
    game.setPlayer1Hand(playerCards);
    game.setPlayer2Hand(opponentCards);
    game.setCurrentPlayer(1);
    game.setRound(1);
    game.setSetupPhase('battle');
    game.setMessage("À toi de jouer ! Tour 1 : tu ne peux poser que des Pokémon de Base.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Entraînement : quand le joueur a validé son deck, l'ordinateur prend le sien.
  useEffect(() => {
    if (mode.kind !== 'entrainement' || rawGame.setupPhase !== 'player2') return;
    const game = gameRef.current;
    const fixedDeck = mode.opponentDeck ? findCardsByName(game, mode.opponentDeck) : [];
    const deck = fixedDeck.length > 0 ? fixedDeck : buildAIDeck(game);
    game.setNoPlacementRestrictions(false);
    game.setPlayer2SetupCards(deck);
    game.setPlayer2Hand(deck);
    game.setPlayer2InvocationCards([]);
    game.setPlayer2SummonChoices({});
    game.setCurrentPlayer(1);
    game.setRound(1);
    game.setSetupPhase('battle');
    game.setMessage("L'ordinateur a choisi son deck. À toi de commencer !");
  }, [mode.kind, rawGame.setupPhase]);

  useOpponentAI(rawGame, true);

  // Messages avant le combat (bouton OK pour passer au suivant).
  const intro = mode.kind === 'autonomie' ? mode.intro ?? [] : [];
  const [introIndex, setIntroIndex] = useState(0);
  const inIntro = introIndex < intro.length;
  const panel: TutorialPanelInfo | undefined = inIntro
    ? {
        text: intro[introIndex],
        canContinue: true,
        opponentPlaying: false,
        hint: '',
        step: introIndex + 1,
        total: intro.length,
        onOk: () => setIntroIndex((index) => index + 1),
      }
    : undefined;

  // Le joueur ne joue que son tour (et répond à ce qui lui est demandé).
  const myChoice =
    (rawGame.pendingScript && (rawGame.pendingScript.chooser ?? rawGame.pendingScript.player) === 1) ||
    rawGame.pendingCoinFlip?.player === 1;
  const blocked = () =>
    inIntro ||
    (rawGame.setupPhase === 'battle' && !rawGame.gameOver && rawGame.currentPlayer === 2 && !myChoice);
  const guard =
    <A extends unknown[]>(action: (...args: A) => void) =>
    (...args: A) => {
      if (blocked()) {
        if (!inIntro) rawGame.setMessage("C'est le tour de l'adversaire : attends qu'il ait fini.");
        return;
      }
      action(...args);
    };

  const game: GameApi = {
    ...rawGame,
    handleHandCardPress: guard((card: GameCard, owner: Player) =>
      owner === 1 || rawGame.setupPhase !== 'battle' ? rawGame.handleHandCardPress(card, owner) : undefined
    ),
    handleCellPress: guard(rawGame.handleCellPress),
    handleSelectAttack: guard(rawGame.handleSelectAttack),
    tryAttackSelectedPokemon: guard(rawGame.tryAttackSelectedPokemon),
    handleEndTurn: guard(rawGame.handleEndTurn),
    activateSelectedTrainerCard: guard(rawGame.activateSelectedTrainerCard),
    startTrainerCoinFlip: guard(rawGame.startTrainerCoinFlip),
    chooseCoinSide: guard(rawGame.chooseCoinSide),
    validatePendingCoinFlip: guard(rawGame.validatePendingCoinFlip),
    handleActivateTalent: guard(rawGame.handleActivateTalent),
    handlePlayerTargetPress: guard(rawGame.handlePlayerTargetPress),
    retreatSelectedPokemon: guard(rawGame.retreatSelectedPokemon),
    handleToolPress: guard(rawGame.handleToolPress),
    undoTurn: guard(rawGame.undoTurn),
    activateInvocationSupporter: guard(rawGame.activateInvocationSupporter),
    // « Nouvelle partie » en autonomie : mêmes decks (pas d'écran de choix).
    restartGame: mode.kind === 'autonomie' ? rawGame.restartSameCards : rawGame.restartGame,
  };

  return { game, panel };
}
