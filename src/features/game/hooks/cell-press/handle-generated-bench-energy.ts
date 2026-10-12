import type { CellPressContext } from './cell-press-context';

/** Choix du Pokémon de banc qui reçoit l'Énergie générée par une attaque. */
export function handleGeneratedBenchEnergy(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    pendingGeneratedBenchEnergy,
    setBoard,
    setMessage,
    setPendingGeneratedBenchEnergy,
  } = context;

  if (!pendingGeneratedBenchEnergy) return false;

  const pokemon = board[cellName];

  if (!pokemon) {
    setMessage('Choisis un Pokémon de banc.');

    return true;
  }

  if (pokemon.owner !== pendingGeneratedBenchEnergy.player) {
    setMessage('Tu dois choisir l’un de tes propres Pokémon.');

    return true;
  }

  if (cellName === pendingGeneratedBenchEnergy.attackerCell) {
    setMessage(
      `${pokemon.card.name} est le Pokémon actif et ne peut pas recevoir cette Énergie.`
    );

    return true;
  }

  const energyType = pendingGeneratedBenchEnergy.energyType;

  const amount = pendingGeneratedBenchEnergy.amount;

  setBoard((previousBoard) => {
    const currentPokemon = previousBoard[cellName];

    if (!currentPokemon) {
      return previousBoard;
    }

    return {
      ...previousBoard,

      [cellName]: {
        ...currentPokemon,

        energies: [...currentPokemon.energies, ...Array(amount).fill(energyType)],
      },
    };
  });

  setMessage(`${pokemon.card.name} reçoit ${amount} Énergie ${energyType}.`);

  setPendingGeneratedBenchEnergy(null);

  return true;
}
