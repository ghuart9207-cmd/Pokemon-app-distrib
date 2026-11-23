import {
  createPokemonInPlay,
  getKOPenalty,
  getOpponentPlacementDamage,
  isTalentNegatedAt,
} from '@/features/game/rules';
import type { PokemonInPlay } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/** Pose d'une Invocation choisie via un Supporter : le joueur clique sur la case où la poser. */
export function handleInvocationPlacement(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    pendingInvocationPlacement,
    setBoard,
    setMessage,
    setPendingInvocationPlacement,
    setPlayer1Damage,
    setPlayer1Discard,
    setPlayer2Damage,
    setPlayer2Discard,
  } = context;

  if (!pendingInvocationPlacement) return false;

  const { player, cards, selectedIndex } = pendingInvocationPlacement;

  if (player !== currentPlayer) {
    return true;
  }

  if (selectedIndex === null) {
    setMessage('Choisis d’abord une des Invocations.');

    return true;
  }

  const allowedRow = player === 1 ? 'B' : 'C';

  if (!cellName.startsWith(allowedRow)) {
    setMessage(
      `Les Invocations du joueur ${player} doivent être posées sur ${allowedRow}1 à ${allowedRow}4.`
    );

    return true;
  }

  if (board[cellName] !== null) {
    setMessage(`${cellName} est déjà occupée.`);

    return true;
  }

  const card = cards[selectedIndex];

  
// Talent annulé si un Pokémon adverse de la même colonne annule les Talents des GX/EX.
const onPlayCard = isTalentNegatedAt(board, cellName, player, card)
  ? { ...card, talent: undefined }
  : card;

const invocation: PokemonInPlay = {
  ...createPokemonInPlay({
    // IMPORTANT : aucune Énergie à l'invocation.
    card,
    owner: player,
    energies: [],
    isInvocation: true,
  }),

  // Protection temporaire accordée à la pose.
  preventAllAttackDamageAndEffects:
    onPlayCard.talent?.type === 'passive' &&
    onPlayCard.talent.effect ===
      'preventAllAttackDamageAndEffectsOnPlayUntilOpponentTurnEnd',

  // La protection expire à la fin du prochain tour adverse.
  preventAllAttackDamageAndEffectsEndPlayer:
    onPlayCard.talent?.type === 'passive' &&
    onPlayCard.talent.effect ===
      'preventAllAttackDamageAndEffectsOnPlayUntilOpponentTurnEnd'
      ? (player === 1 ? 2 : 1)
      : null,
};


  const placementDamage = getOpponentPlacementDamage(board, player);

  const invocationAfterPlacementDamage: PokemonInPlay = {
    ...invocation,

    currentHp: invocation.currentHp - placementDamage,
  };

  const knockedOutOnPlacement = invocationAfterPlacementDamage.currentHp <= 0;

  if (knockedOutOnPlacement) {
    // L'Invocation arrive,
    // subit le Talent de Noctunoir,
    // puis est K.O.
    setBoard((previousBoard) => ({
      ...previousBoard,

      [cellName]: null,
    }));

    const penalty = getKOPenalty(card.stage, card.variant);

    if (player === 1) {
      setPlayer1Damage((damage) => damage + penalty);

      setPlayer1Discard((discard) => [...discard, card]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);

      setPlayer2Discard((discard) => [...discard, card]);
    }
  } else {
    // L'Invocation survit
    // et reste sur le plateau
    // avec les dégâts reçus.
    setBoard((previousBoard) => ({
      ...previousBoard,

      [cellName]: invocationAfterPlacementDamage,
    }));
  }

  // On retire seulement
  // l'Invocation qui vient
  // d'être posée.
  //
  // Important car les deux
  // cartes peuvent avoir le
  // même id.
  const remainingCards = cards.filter((_, index) => index !== selectedIndex);

  // -----------------------------------------
  // INVOCATION PAR UNE ATTAQUE (réserve)
  // -----------------------------------------
  if (pendingInvocationPlacement.source === 'attack') {
    const remainingToPlace = (pendingInvocationPlacement.remainingToPlace ?? 1) - 1;
    const freeCellsLeft = [1, 2, 3, 4]
      .map((column) => `${allowedRow}${column}`)
      .filter((cell) => board[cell] === null && (cell !== cellName || knockedOutOnPlacement));

    const placedText = knockedOutOnPlacement
      ? `${card.name} est invoqué en ${cellName}, subit ${placementDamage} dégâts et est K.O. !`
      : placementDamage > 0
        ? `${card.name} est invoqué en ${cellName} avec 0 Énergie et subit ${placementDamage} dégâts.`
        : `${card.name} est invoqué en ${cellName} avec 0 Énergie.`;

    if (remainingToPlace > 0 && remainingCards.length > 0 && freeCellsLeft.length > 0) {
      setPendingInvocationPlacement({
        ...pendingInvocationPlacement,
        cards: remainingCards,
        selectedIndex: null,
        remainingToPlace,
      });
      setMessage(`${placedText} Choisis maintenant la deuxième Invocation.`);
      return true;
    }

    setPendingInvocationPlacement(null);
    setMessage(placedText);
    return true;
  }

  if (remainingCards.length === 0) {
    setPendingInvocationPlacement(null);

    if (knockedOutOnPlacement) {
      setMessage(
        `${card.name} est invoqué en ${cellName}, subit ${placementDamage} dégâts à cause d'Invitation Obscure et est K.O. !`
      );
    } else if (placementDamage > 0) {
      setMessage(
        `${card.name} est invoqué en ${cellName} avec 0 Énergie et subit ${placementDamage} dégâts à cause d'Invitation Obscure.`
      );
    } else {
      setMessage(`${card.name} est invoqué en ${cellName} avec 0 Énergie.`);
    }
    return true;
  }

  setPendingInvocationPlacement({
    ...pendingInvocationPlacement,

    cards: remainingCards,

    selectedIndex: null,
  });

  if (knockedOutOnPlacement) {
    setMessage(
      `${card.name} est invoqué en ${cellName}, subit ${placementDamage} dégâts à cause d'Invitation Obscure et est K.O. ! Choisis maintenant la deuxième Invocation.`
    );
  } else if (placementDamage > 0) {
    setMessage(
      `${card.name} est invoqué en ${cellName} avec 0 Énergie et subit ${placementDamage} dégâts à cause d'Invitation Obscure. Choisis maintenant la deuxième Invocation.`
    );
  } else {
    setMessage(
      `${card.name} est invoqué en ${cellName} avec 0 Énergie. Choisis maintenant la deuxième Invocation.`
    );
  }

  return true;
}
