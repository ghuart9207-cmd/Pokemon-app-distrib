import type { CellPressContext } from './cell-press-context';
import { canAttachEnergyFromSource } from
  '@/features/game/rules';

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

  const moveFromAttacker =
  pendingGeneratedBenchEnergy.moveFromAttacker;

const attackerCell =
  pendingGeneratedBenchEnergy.attackerCell;


if (moveFromAttacker) {
  const attacker = board[attackerCell];

  if (
    !attacker ||
    attacker.energies.filter(
      (energy) => energy === energyType
    ).length < amount
  ) {
    setMessage(
      "Le Pokémon attaquant n'a pas assez d'Énergies à transférer."
    );
    setPendingGeneratedBenchEnergy(null);
    return true;
  }

  setBoard((previousBoard) => {
    const source = previousBoard[attackerCell];
    const destination = previousBoard[cellName];

    if (
      !source ||
      !destination ||
      source.owner !== destination.owner
    ) {
      return previousBoard;
    }

    const remainingEnergies = [...source.energies];

    for (let i = 0; i < amount; i++) {
      const index = remainingEnergies.indexOf(energyType);

      if (index === -1) {
        return previousBoard;
      }

      remainingEnergies.splice(index, 1);
    }

    return {
      ...previousBoard,

      [attackerCell]: {
        ...source,
        energies: remainingEnergies,
      },

      [cellName]: {
        ...destination,
        energies: [
          ...destination.energies,
          ...Array(amount).fill(energyType),
        ],
      },
    };
  });

  setMessage(
    `${attacker.card.name} transfère ${amount} Énergie ${energyType} à ${pokemon.card.name}.`
  );

  setPendingGeneratedBenchEnergy(null);
  return true;
}


  // Énergies créées : considérées comme venant de la main.
  // On vérifie l'interdiction sur le Pokémon choisi.
  if (!canAttachEnergyFromSource(pokemon, 'hand')) {
    const hasAnotherValidTarget = Object.entries(board).some(
      ([candidateCell, candidate]) =>
        candidateCell !== attackerCell &&
        candidate !== null &&
        candidate.owner === pendingGeneratedBenchEnergy.player &&
        canAttachEnergyFromSource(candidate, 'hand')
    );

    setMessage(
      hasAnotherValidTarget
        ? `${pokemon.card.name} ne peut pas recevoir cette Énergie. Choisis un autre Pokémon de banc.`
        : "Aucun Pokémon de banc ne peut recevoir cette Énergie."
    );

    if (!hasAnotherValidTarget) {
      setPendingGeneratedBenchEnergy(null);
    }

    return true;
  }

  setBoard((previousBoard) => {
    const currentPokemon = previousBoard[cellName];

    
if (
  !currentPokemon ||
  !canAttachEnergyFromSource(currentPokemon, 'hand')
) {
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
