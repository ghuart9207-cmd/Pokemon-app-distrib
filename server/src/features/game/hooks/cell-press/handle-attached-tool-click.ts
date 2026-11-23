import type { CellPressContext } from './cell-press-context';

/** Clic sur un Pokémon pendant l'affichage d'un Outil attaché : cible interdite pour une Invocation, sinon on masque l'Outil. */
export function handleAttachedToolClick(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    selectedAttachedTool,
    setMessage,
    setSelectedAttachedTool,
  } = context;

  if (!selectedAttachedTool) return false;

  const clickedPokemon = board[cellName];

  if (clickedPokemon?.isInvocation) {
    setMessage(
      `${clickedPokemon.card.name} est une Invocation et ne peut pas être ciblé par une carte Dresseur.`
    );

    return true;
  }

  if (clickedPokemon && clickedPokemon.owner === currentPlayer) {
    setSelectedAttachedTool(null);
  }

  return false;
}
