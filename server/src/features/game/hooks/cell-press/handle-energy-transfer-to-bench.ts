
import type { CellPressContext } from './cell-press-context';

/** Transfère toutes les Énergies vers un Pokémon de Banc choisi. */
export function handleEnergyTransferToBench(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    pendingEnergyTransferToBench,
    setBoard,
    setMessage,
    setPendingEnergyTransferToBench,
  } = context;

  if (!pendingEnergyTransferToBench) {
    return false;
  }

  const target = board[cellName];

  if (!target) {
    setMessage('Choisis un de tes Pokémon de Banc.');
    return true;
  }

  if (target.owner !== pendingEnergyTransferToBench.player) {
    setMessage('Tu dois choisir un de tes propres Pokémon.');
    return true;
  }

  if (cellName === pendingEnergyTransferToBench.attackerCell) {
    setMessage('Choisis un autre Pokémon que le Pokémon attaquant.');
    return true;
  }


  // Effet qui donne des Énergies : seul un Pokémon de ce type peut les recevoir.
  if (
    pendingEnergyTransferToBench.targetPokemonType &&
    target.card.type !== pendingEnergyTransferToBench.targetPokemonType
  ) {
    setMessage(`Choisis un Pokémon de type ${pendingEnergyTransferToBench.targetPokemonType}.`);
    return true;
  }


  const source = board[pendingEnergyTransferToBench.attackerCell];

  if (!source || source.energies.length === 0) {
    setPendingEnergyTransferToBench(null);
    setMessage("Il n'y a plus d'Énergie à transférer.");
    return true;
  }

  const transferredEnergies = [...source.energies];
  const energyCount = transferredEnergies.length;

  setBoard((previousBoard) => {
    const currentSource =
      previousBoard[pendingEnergyTransferToBench.attackerCell];
    const currentTarget = previousBoard[cellName];

    if (!currentSource || !currentTarget) {
      return previousBoard;
    }

    const energiesToTransfer = [...currentSource.energies];

    return {
      ...previousBoard,

      [pendingEnergyTransferToBench.attackerCell]: {
        ...currentSource,
        energies: [],
      },

      [cellName]: {
        ...currentTarget,
        energies: [
          ...currentTarget.energies,
          ...energiesToTransfer,
        ],
      },
    };
  });

  setPendingEnergyTransferToBench(null);

  setMessage(
    `${energyCount} Énergie(s) transférée(s) vers ${target.card.name}.`
  );

  return true;
}
