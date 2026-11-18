import type { CellPressContext } from './cell-press-context';

/** Code des cartes : un clic sert à choisir la cible du script en cours. */
export function handleScriptTarget(context: CellPressContext, cellName: string): boolean {
  return context.handleScriptCellPress?.(cellName) ?? false;
}
