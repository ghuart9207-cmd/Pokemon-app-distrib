import type { CellPressContext } from './cell-press-context';

/** Clic sur une case vide sans action en cours : on efface la sélection. */
export function handleEmptyCell(context: CellPressContext): boolean {
  const { setMessage, setSelectedAttackIndex, setSelectedPokemonCell } = context;

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage('Cette case est vide.');

  return true;
}
