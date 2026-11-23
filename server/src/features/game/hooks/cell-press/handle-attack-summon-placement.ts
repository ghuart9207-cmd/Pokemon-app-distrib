import {
  createPokemonInPlay,
  getKOPenalty,
  getOpponentPlacementDamage,
} from '@/features/game/rules';
import type { PokemonInPlay } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/**
 * Pose d'une Invocation créée par une attaque (effet 'summonPokemon',
 * ex : Division de Tadmorv d'Alola).
 *
 * - Joueur 1 : B1 à B4 / Joueur 2 : C1 à C4.
 * - La case doit être vide.
 * - L'Invocation arrive avec 0 Énergie et isInvocation = true
 *   (elle ne peut donc pas être ciblée par les cartes Dresseur).
 */
export function handleAttackSummonPlacement(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    pendingAttackSummonPlacement,
    setBoard,
    setMessage,
    setPendingAttackSummonPlacement,
    setPlayer1Damage,
    setPlayer1Discard,
    setPlayer2Damage,
    setPlayer2Discard,
  } = context;

  if (!pendingAttackSummonPlacement) return false;

  const { player, card, remaining, attackName } = pendingAttackSummonPlacement;

  // Le tour a changé sans que l'Invocation soit posée :
  // on l'annule et on laisse le clic suivre son cours normal.
  if (player !== currentPlayer) {
    setPendingAttackSummonPlacement(null);
    return false;
  }

  const allowedRow = player === 1 ? 'B' : 'C';

  if (!cellName.startsWith(allowedRow)) {
    setMessage(
      `${attackName} : choisis une case libre de ${allowedRow}1 à ${allowedRow}4 pour invoquer ${card.name}.`
    );
    return true;
  }

  if (board[cellName] !== null) {
    setMessage(`${cellName} est déjà occupée. Choisis une case libre de ${allowedRow}1 à ${allowedRow}4.`);
    return true;
  }

  const invocation: PokemonInPlay = createPokemonInPlay({
    // IMPORTANT : aucune Énergie à l'invocation.
    card,
    owner: player,
    energies: [],
    isInvocation: true,
  });

  // Même règle que les Invocations du Fan Club :
  // le Talent adverse « dégâts à la pose » s'applique.
  const placementDamage = getOpponentPlacementDamage(board, player);

  const invocationAfterPlacementDamage: PokemonInPlay = {
    ...invocation,
    currentHp: invocation.currentHp - placementDamage,
  };

  const knockedOutOnPlacement = invocationAfterPlacementDamage.currentHp <= 0;

  if (knockedOutOnPlacement) {
    const penalty = getKOPenalty(card.stage, card.variant);

    if (player === 1) {
      setPlayer1Damage((damage) => damage + penalty);
      setPlayer1Discard((discard) => [...discard, card]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);
      setPlayer2Discard((discard) => [...discard, card]);
    }
  } else {
    setBoard((previousBoard) => ({
      ...previousBoard,
      [cellName]: invocationAfterPlacementDamage,
    }));
  }

  // Reste-t-il des Invocations à poser, et de la place pour le faire ?
  const remainingAfter = remaining - 1;

  const freeCellsLeft = [1, 2, 3, 4]
    .map((column) => `${allowedRow}${column}`)
    .filter(
      (cell) =>
        board[cell] === null &&
        (cell !== cellName || knockedOutOnPlacement)
    );

  const baseMessage = knockedOutOnPlacement
    ? `${card.name} est invoqué en ${cellName}, subit ${placementDamage} dégâts à la pose et est K.O. !`
    : placementDamage > 0
      ? `${card.name} est invoqué en ${cellName} avec 0 Énergie et subit ${placementDamage} dégâts à la pose.`
      : `${card.name} est invoqué en ${cellName} avec 0 Énergie.`;

  if (remainingAfter > 0 && freeCellsLeft.length > 0) {
    setPendingAttackSummonPlacement({
      ...pendingAttackSummonPlacement,
      remaining: remainingAfter,
    });

    setMessage(`${baseMessage} Choisis la case de l'Invocation suivante.`);
    return true;
  }

  setPendingAttackSummonPlacement(null);
  setMessage(baseMessage);

  return true;
}
