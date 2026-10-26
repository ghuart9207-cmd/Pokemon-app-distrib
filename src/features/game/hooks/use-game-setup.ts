import { useState } from 'react';

import {
  canPlacePokemon,
  describeAttackInvocationRule,
  getNextSummonerNeedingChoice,
  getSummonChoiceEffect,
  isPokemonCard,
  isValidAttackInvocation,
} from '@/features/game/rules';
import type { SummonChoices } from '@/features/game/rules';
import type { CardSeriesInfo } from '@/features/game/data';
import type {
  GameCard,
  Player,
  PokemonCard,
  SetState,
  SetupPhase,
} from '@/features/game/types';

type UseGameSetupOptions = {
  cardSeries: CardSeriesInfo;
  player1SummonChoices: SummonChoices;
  player2SummonChoices: SummonChoices;
  setPlayer1SummonChoices: SetState<SummonChoices>;
  setPlayer2SummonChoices: SetState<SummonChoices>;
  setCurrentPlayer: SetState<Player>;
  setMessage: SetState<string>;
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  setRound: SetState<number>;
};

// Nombre maximum de Pokémon GX ou EX dans les 8 Pokémon choisis.
export const MAX_GX_EX_IN_SETUP = 2;

function isGxOrExCard(card: GameCard): boolean {
  return (
    isPokemonCard(card) &&
    (card.variant === 'gx' || card.variant === 'ex' || card.stage === 'mega_ex')
  );
}

/**
 * Conseils sur le deck (non bloquants) :
 * - tour 1 : seuls les Pokémon de Base peuvent être posés ;
 * - tour 2 : il faut un 2ᵉ Pokémon posable (une 2ᵉ Base ou un Niveau 1).
 */
function getDeckWarnings(cards: GameCard[]): string[] {
  const pokemonCards = cards.filter(isPokemonCard);

  const playableTurn1 = pokemonCards.filter((card) => canPlacePokemon(card, 1)).length;
  const playableTurn2 = pokemonCards.filter((card) => canPlacePokemon(card, 2)).length;

  const warnings: string[] = [];

  if (playableTurn1 === 0) {
    warnings.push(
      "⚠️ Tu n'as aucun Pokémon de Base : au tour 1, on ne peut poser que des Bases. Je te conseille d'en prendre au moins une."
    );
  }

  if (playableTurn2 < 2) {
    warnings.push(
      "⚠️ Au tour 2, tu n'auras pas de nouveau Pokémon à poser : je te conseille de prendre une 2ᵉ Base ou un Niveau 1."
    );
  }

  return warnings;
}

function getSetupCounts(cards: GameCard[]) {
  const pokemonCount = cards.filter(isPokemonCard).length;
  const gxExCount = cards.filter(isGxOrExCard).length;
  const objectCount = cards.filter(
    (card) => !isPokemonCard(card) && card.category === 'objet'
  ).length;
  const supporterCount = cards.filter(
    (card) => !isPokemonCard(card) && card.category === 'supporter'
  ).length;

  return { pokemonCount, gxExCount, objectCount, supporterCount };
}

/** Étape du choix des Invocations : Fan Club (2) ou Invocation d'un Pokémon qui invoque (1). */
export type InvocationSetupKind = 'supporter' | 'summonChoice';

export function useGameSetup({
  cardSeries,
  player1SummonChoices,
  player2SummonChoices,
  setPlayer1SummonChoices,
  setPlayer2SummonChoices,
  setCurrentPlayer,
  setMessage,
  setPlayer1Hand,
  setPlayer2Hand,
  setRound,
}: UseGameSetupOptions) {
  const [setupPhase, setSetupPhase] = useState<SetupPhase>('player1');
  const [player1SetupCards, setPlayer1SetupCards] = useState<GameCard[]>([]);
  const [player2SetupCards, setPlayer2SetupCards] = useState<GameCard[]>([]);
  const [player1InvocationCards, setPlayer1InvocationCards] = useState<PokemonCard[]>([]);
  const [player2InvocationCards, setPlayer2InvocationCards] = useState<PokemonCard[]>([]);
  const [invocationSetupPlayer, setInvocationSetupPlayer] = useState<Player | null>(null);
  const [invocationSetupKind, setInvocationSetupKind] =
    useState<InvocationSetupKind>('supporter');
  // Pokémon qui invoque dont on choisit l'Invocation, et le choix en cours (0 ou 1 carte).
  const [invocationSetupSummoner, setInvocationSetupSummoner] = useState<PokemonCard | null>(
    null
  );
  const [summonChoiceDraft, setSummonChoiceDraft] = useState<PokemonCard[]>([]);

  // Deck pour lequel le joueur a déjà vu les conseils :
  // un 2ᵉ clic sur VALIDER garde ce deck quand même.
  const [setupWarningKey, setSetupWarningKey] = useState<string | null>(null);

  function toggleSetupCard(card: GameCard) {
    if (setupPhase === 'battle') {
      return;
    }

    // Les séries ne se mélangent pas : on refuse une carte d'une autre série.
    const isInSeries = isPokemonCard(card)
      ? cardSeries.pokemon.some((seriesCard) => seriesCard.id === card.id)
      : cardSeries.trainers.some((seriesCard) => seriesCard.id === card.id);

    if (!isInSeries) {
      setMessage(`${card.name} ne fait pas partie de la série ${cardSeries.label}.`);
      return;
    }

    const currentCards = setupPhase === 'player1' ? player1SetupCards : player2SetupCards;
    const setCards =
      setupPhase === 'player1' ? setPlayer1SetupCards : setPlayer2SetupCards;

    if (currentCards.some((selectedCard) => selectedCard.id === card.id)) {
      setCards(currentCards.filter((selectedCard) => selectedCard.id !== card.id));
      return;
    }

    const { pokemonCount, gxExCount, objectCount, supporterCount } =
      getSetupCounts(currentCards);

    if (isPokemonCard(card) && pokemonCount >= 8) {
      setMessage('Tu as déjà choisi tes 8 Pokémon.');
      return;
    }

    if (isGxOrExCard(card) && gxExCount >= MAX_GX_EX_IN_SETUP) {
      setMessage(
        `Tu ne peux pas prendre plus de ${MAX_GX_EX_IN_SETUP} Pokémon GX ou EX. Retire-en un pour choisir ${card.name}.`
      );
      return;
    }

    if (!isPokemonCard(card) && card.category === 'objet' && objectCount >= 3) {
      setMessage('Tu as déjà choisi tes 3 Objets.');
      return;
    }

    if (!isPokemonCard(card) && card.category === 'supporter' && supporterCount >= 2) {
      setMessage('Tu as déjà choisi tes 2 Supporters.');
      return;
    }

    setCards([...currentCards, card]);
  }

  function confirmSetupSelection() {
    if (setupPhase === 'battle') {
      return;
    }

    const cards = setupPhase === 'player1' ? player1SetupCards : player2SetupCards;
    const { pokemonCount, gxExCount, objectCount, supporterCount } =
      getSetupCounts(cards);

    if (gxExCount > MAX_GX_EX_IN_SETUP) {
      setMessage(
        `Tu as ${gxExCount} Pokémon GX ou EX : le maximum est ${MAX_GX_EX_IN_SETUP}.`
      );
      return;
    }

    if (pokemonCount !== 8 || objectCount !== 3 || supporterCount !== 2) {
      setMessage(
        `Il faut exactement 8 Pokémon, 3 Objets et 2 Supporters. Actuellement : ${pokemonCount}/8 Pokémon, ${objectCount}/3 Objets, ${supporterCount}/2 Supporters.`
      );
      return;
    }

    // Conseils sur les Bases / Niveau 1 : affichés une fois,
    // puis un 2ᵉ clic sur VALIDER confirme le deck quand même.
    const deckWarnings = getDeckWarnings(cards);
    const deckKey = `${setupPhase}:${cards.map((card) => card.id).join(',')}`;

    if (deckWarnings.length > 0 && setupWarningKey !== deckKey) {
      setSetupWarningKey(deckKey);
      setMessage(
        `${deckWarnings.join('\n')}\nClique à nouveau sur VALIDER pour garder ce deck quand même.`
      );
      return;
    }

    setSetupWarningKey(null);

    const hasInvocationSupporter = cards.some(
      (card) => !isPokemonCard(card) && card.effect === 'summonTwoBase60'
    );

    const player: Player = setupPhase === 'player1' ? 1 : 2;

    if (player === 1) {
      setPlayer1Hand([...cards]);
    } else {
      setPlayer2Hand([...cards]);
    }

    // Nouveau deck : les Invocations des Pokémon qui invoquent sont à rechoisir.
    setSummonChoicesFor(player, {});

    // Fan Club Pokémon : 2 Invocations à choisir d'abord.
    if (hasInvocationSupporter) {
      startSupporterInvocationSetup(player);
      return;
    }

    // Pas de Fan Club : pas d'Invocations de Fan Club.
    if (player === 1) {
      setPlayer1InvocationCards([]);
    } else {
      setPlayer2InvocationCards([]);
    }

    // Pokémon qui invoquent : 1 Invocation à choisir pour chacun.
    if (startSummonChoiceSetup(player, {}, [])) {
      return;
    }

    finishPlayerSetup(player);
  }

  function startSupporterInvocationSetup(player: Player) {
    if (player === 1) {
      setPlayer1InvocationCards([]);
    } else {
      setPlayer2InvocationCards([]);
    }

    setInvocationSetupKind('supporter');
    setInvocationSetupPlayer(player);
    setMessage(
      `Joueur ${player} : choisis 2 Pokémon de Base ayant 60 PV ou moins pour Invocation Duo.`
    );
  }

  function getSummonChoices(player: Player): SummonChoices {
    return player === 1 ? player1SummonChoices : player2SummonChoices;
  }

  function setSummonChoicesFor(player: Player, choices: SummonChoices) {
    if (player === 1) {
      setPlayer1SummonChoices(choices);
    } else {
      setPlayer2SummonChoices(choices);
    }
  }

  /**
   * Démarre le choix de l'Invocation du prochain Pokémon qui invoque
   * (deck, Invocations du Fan Club, puis Invocations déjà choisies).
   * Renvoie false s'il n'y en a plus.
   */
  function startSummonChoiceSetup(
    player: Player,
    choices: SummonChoices,
    fanClubCardsOverride?: PokemonCard[]
  ): boolean {
    const fanClubCards =
      fanClubCardsOverride ?? (player === 1 ? player1InvocationCards : player2InvocationCards);
    const summoner = getNextSummonerNeedingChoice(
      [...getSetupDeck(player), ...fanClubCards],
      choices
    );

    if (!summoner) {
      return false;
    }

    const rule = getSummonChoiceEffect(summoner);

    setInvocationSetupSummoner(summoner);
    setSummonChoiceDraft([]);
    setInvocationSetupKind('summonChoice');
    setInvocationSetupPlayer(player);
    setMessage(
      `Joueur ${player} : choisis le Pokémon que ${summoner.name} invoquera` +
        (rule ? ` (${describeAttackInvocationRule(rule)}).` : '.')
    );
    return true;
  }

  /** Préparation du joueur terminée : au tour du joueur 2, ou début de la partie. */
  function finishPlayerSetup(player: Player) {
    setInvocationSetupPlayer(null);
    setInvocationSetupKind('supporter');
    setInvocationSetupSummoner(null);
    setSummonChoiceDraft([]);

    if (player === 1) {
      setSetupPhase('player2');
      setMessage(
        'Main du joueur 1 enregistrée. Joueur 2 : choisis maintenant tes cartes.'
      );
      return;
    }

    setSetupPhase('battle');
    setCurrentPlayer(1);
    setRound(1);
    setMessage(
      'Les deux joueurs ont choisi leurs cartes. Début de la partie : tour du joueur 1.'
    );
  }

  function getSetupDeck(player: Player): GameCard[] {
    return player === 1 ? player1SetupCards : player2SetupCards;
  }

  /** Les Pokémon possibles pour l'Invocation en cours de choix. */
  function getSummonChoiceCandidates(): PokemonCard[] {
    const rule = invocationSetupSummoner ? getSummonChoiceEffect(invocationSetupSummoner) : null;
    if (!rule) return [];
    return cardSeries.pokemon.filter((card) => isValidAttackInvocation(card, rule));
  }

  function addInvocationSetupCard(card: PokemonCard) {
    if (!invocationSetupPlayer) {
      return;
    }

    if (!cardSeries.pokemon.some((seriesCard) => seriesCard.id === card.id)) {
      setMessage(`${card.name} ne fait pas partie de la série ${cardSeries.label}.`);
      return;
    }

    // Invocation d'un Pokémon qui invoque : UN seul Pokémon (il remplace le précédent).
    if (invocationSetupKind === 'summonChoice') {
      const rule = invocationSetupSummoner
        ? getSummonChoiceEffect(invocationSetupSummoner)
        : null;
      if (!rule) return;

      if (!isValidAttackInvocation(card, rule)) {
        setMessage(`${card.name} n'est pas un ${describeAttackInvocationRule(rule)}.`);
        return;
      }

      setSummonChoiceDraft([card]);
      return;
    }

    const setCards =
      invocationSetupPlayer === 1 ? setPlayer1InvocationCards : setPlayer2InvocationCards;

    setCards((previous) => (previous.length >= 2 ? previous : [...previous, card]));
  }

  function removeInvocationSetupCard(index: number) {
    if (!invocationSetupPlayer) {
      return;
    }

    if (invocationSetupKind === 'summonChoice') {
      setSummonChoiceDraft([]);
      return;
    }

    const setCards =
      invocationSetupPlayer === 1 ? setPlayer1InvocationCards : setPlayer2InvocationCards;

    setCards((previous) => previous.filter((_, cardIndex) => cardIndex !== index));
  }

  function confirmInvocationSetup() {
    if (!invocationSetupPlayer) {
      return;
    }

    const player = invocationSetupPlayer;

    // ----- Invocation d'un Pokémon qui invoque -----
    if (invocationSetupKind === 'summonChoice') {
      if (!invocationSetupSummoner) return;

      const hasCandidates = getSummonChoiceCandidates().length > 0;

      if (summonChoiceDraft.length !== 1 && hasCandidates) {
        setMessage('Choisis 1 Pokémon.');
        return;
      }

      // Aucun Pokémon possible dans la série : on enregistre « aucun ».
      const nextChoices: SummonChoices = {
        ...getSummonChoices(player),
        [invocationSetupSummoner.id]: summonChoiceDraft[0] ?? null,
      };

      setSummonChoicesFor(player, nextChoices);

      if (startSummonChoiceSetup(player, nextChoices)) {
        return;
      }

      finishPlayerSetup(player);
      return;
    }

    // ----- Fan Club Pokémon -----
    const invocationCards =
      player === 1 ? player1InvocationCards : player2InvocationCards;

    if (invocationCards.length !== 2) {
      setMessage('Choisis exactement 2 Invocations.');
      return;
    }

    // Ensuite, les Invocations des Pokémon qui invoquent (deck et Fan Club).
    if (startSummonChoiceSetup(player, getSummonChoices(player))) {
      return;
    }

    finishPlayerSetup(player);
  }

  return {
    addInvocationSetupCard,
    confirmInvocationSetup,
    confirmSetupSelection,
    getSetupCounts,
    invocationSetupPlayer,
    invocationSetupKind,
    invocationSetupSummoner,
    summonChoiceDraft,
    player1InvocationCards,
    player1SetupCards,
    player2InvocationCards,
    player2SetupCards,
    removeInvocationSetupCard,
    setInvocationSetupPlayer,
    setPlayer1InvocationCards,
    setPlayer1SetupCards,
    setPlayer2InvocationCards,
    setPlayer2SetupCards,
    setSetupPhase,
    setupPhase,
    toggleSetupCard,
  };
}
