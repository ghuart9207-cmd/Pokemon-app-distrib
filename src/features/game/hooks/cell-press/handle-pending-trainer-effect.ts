import type { CellPressContext } from './cell-press-context';
import {
  applyGenericTrainerEffect,
  getTrainerTargetError,
  hasValidTrainerTarget,
} from './trainer-effects/generic-trainer-effect';

/**
 * Carte Dresseur « à réglages » avec lancer de pièce : après FACE, la carte est déjà
 * défaussée, le joueur clique sur le Pokémon qui reçoit l'effet.
 */
export function handlePendingTrainerEffect(context: CellPressContext, cellName: string): boolean {
  const { board, currentPlayer, pendingTrainerEffect, setPendingTrainerEffect, setBoard, setMessage, endTurn } =
    context;

  if (!pendingTrainerEffect) return false;

  const { card, player } = pendingTrainerEffect;

  // Le tour a changé : l'effet est perdu.
  if (player !== currentPlayer) {
    setPendingTrainerEffect(null);
    return false;
  }

  // Plus aucun Pokémon possible : l'effet est perdu.
  if (!hasValidTrainerTarget(card, board, player)) {
    setPendingTrainerEffect(null);
    setMessage(`${card.name} : plus aucun Pokémon ne peut recevoir l'effet.`);
    return true;
  }

  const error = getTrainerTargetError(card, board, cellName, player);
  if (error) {
    setMessage(error);
    return true;
  }

  const result = applyGenericTrainerEffect(card, board, cellName);
  setPendingTrainerEffect(null);

  if (card.endTurnAfter) {
    endTurn(result.board);
    return true;
  }

  setBoard(result.board);
  setMessage(result.message);
  return true;
}
