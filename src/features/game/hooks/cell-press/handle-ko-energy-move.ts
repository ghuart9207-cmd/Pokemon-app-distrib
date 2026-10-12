import type { EnergyType } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/** Outil : déplacement d'une Énergie vers un autre Pokémon après un K.O. */
export function handleKOEnergyMove(context: CellPressContext, cellName: string): boolean {
  const {
    board,
    pendingKOEnergyMove,
    setBoard,
    setMessage,
    setPendingKOEnergyMove,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
  } = context;

  if (!pendingKOEnergyMove) return false;

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

  const energyToMove = pendingKOEnergyMove.selectedEnergy;

  // Ajoute l'Énergie au Pokémon choisi
  setBoard((previousBoard) => {
    const currentTarget = previousBoard[cellName];

    if (!currentTarget) {
      return previousBoard;
    }

    return {
      ...previousBoard,

      [cellName]: {
        ...currentTarget,

        energies: [...currentTarget.energies, energyToMove],
      },
    };
  });

  // Retire UNE occurrence
  // de cette Énergie de la défausse
  const removeEnergyFromDiscard = (discard: EnergyType[]) => {
    const index = discard.findIndex((energy) => energy === energyToMove);

    if (index === -1) {
      return discard;
    }

    const newDiscard = [...discard];

    newDiscard.splice(index, 1);

    return newDiscard;
  };

  if (pendingKOEnergyMove.player === 1) {
    setPlayer1DiscardEnergies(removeEnergyFromDiscard);
  } else {
    setPlayer2DiscardEnergies(removeEnergyFromDiscard);
  }

  setMessage(
    `${energyToMove} de ${pendingKOEnergyMove.sourcePokemonName} est déplacée vers ${target.card.name}.`
  );

  setPendingKOEnergyMove(null);

  return true;
}
