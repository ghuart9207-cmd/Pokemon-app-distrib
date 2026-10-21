import { useState } from 'react';

import { isPokemonCard } from '@/features/game/rules';
import type {
  GameCard,
  Player,
  PokemonCard,
  SetState,
  SetupPhase,
} from '@/features/game/types';

type UseGameSetupOptions = {
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

export function useGameSetup({
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

  function toggleSetupCard(card: GameCard) {
    if (setupPhase === 'battle') {
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

    const hasInvocationSupporter = cards.some(
      (card) => !isPokemonCard(card) && card.effect === 'summonTwoBase60'
    );

    if (setupPhase === 'player1') {
      setPlayer1Hand([...cards]);

      if (hasInvocationSupporter) {
        setPlayer1InvocationCards([]);
        setInvocationSetupPlayer(1);
        setMessage(
          'Joueur 1 : choisis 2 Pokémon de Base ayant 60 PV ou moins pour Invocation Duo.'
        );
        return;
      }

      setSetupPhase('player2');
      setMessage(
        'Main du joueur 1 enregistrée. Joueur 2 : choisis maintenant tes cartes.'
      );
      return;
    }

    setPlayer2Hand([...cards]);

    if (hasInvocationSupporter) {
      setPlayer2InvocationCards([]);
      setInvocationSetupPlayer(2);
      setMessage(
        'Joueur 2 : choisis 2 Pokémon de Base ayant 60 PV ou moins pour Invocation Duo.'
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

  function addInvocationSetupCard(card: PokemonCard) {
    if (!invocationSetupPlayer) {
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

    const setCards =
      invocationSetupPlayer === 1 ? setPlayer1InvocationCards : setPlayer2InvocationCards;

    setCards((previous) => previous.filter((_, cardIndex) => cardIndex !== index));
  }

  function confirmInvocationSetup() {
    const invocationCards =
      invocationSetupPlayer === 1 ? player1InvocationCards : player2InvocationCards;

    if (invocationCards.length !== 2) {
      setMessage('Choisis exactement 2 Invocations.');
      return;
    }

    setInvocationSetupPlayer(null);

    if (invocationSetupPlayer === 1) {
      setSetupPhase('player2');
      setMessage('Joueur 2 : choisis 8 Pokémon, 3 Objets et 2 Supporters.');
      return;
    }

    setSetupPhase('battle');
    setCurrentPlayer(1);
    setMessage('Tour du joueur 1 — Manche 1/8');
  }

  return {
    addInvocationSetupCard,
    confirmInvocationSetup,
    confirmSetupSelection,
    getSetupCounts,
    invocationSetupPlayer,
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
