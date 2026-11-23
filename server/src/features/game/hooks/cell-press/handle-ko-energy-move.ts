import { applyKOEnergyMove } from './apply-ko-energy-move';
import type { CellPressContext } from './cell-press-context';

/**
 * Outil Relais Optimiste : après un K.O., déplace jusqu'à 2 Énergies
 * vers UN SEUL des Pokémon du joueur.
 */
export function handleKOEnergyMove(context: CellPressContext, cellName: string): boolean {
  const { board, pendingKOEnergyMove, setMessage } = context;

  if (!pendingKOEnergyMove) return false;

  // La cible est déjà choisie : la deuxième Énergie s'attache
  // automatiquement dès qu'on la choisit dans le panneau.
  if (pendingKOEnergyMove.targetCell) {
    const lockedTarget = board[pendingKOEnergyMove.targetCell];

    setMessage(
      `Choisis la deuxième Énergie dans le panneau Relais d’Énergie : elle ira sur ${lockedTarget?.card.name ?? 'le même Pokémon'}.`
    );

    return true;
  }

  const target = board[cellName];

  if (!pendingKOEnergyMove.selectedEnergy) {
    setMessage('Choisis d’abord l’Énergie que tu veux déplacer.');

    return true;
  }

  if (!target) {
    setMessage('Choisis l’un de tes Pokémon en jeu.');

    return true;
  }

  if (target.owner !== pendingKOEnergyMove.player) {
    setMessage('Tu dois choisir l’un de tes propres Pokémon.');

    return true;
  }

  applyKOEnergyMove(
    context,
    pendingKOEnergyMove,
    pendingKOEnergyMove.selectedEnergy,
    cellName
  );

  return true;
}
