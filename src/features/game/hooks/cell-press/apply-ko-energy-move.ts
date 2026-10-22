import type {
  BoardState,
  EnergyType,
  PendingKOEnergyMove,
  SetState,
} from '@/features/game/types';

type KOEnergyMoveDeps = {
  board: BoardState;
  setBoard: SetState<BoardState>;
  setMessage: SetState<string>;
  setPendingKOEnergyMove: SetState<PendingKOEnergyMove | null>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
};

/**
 * Relais Optimiste : attache l'Énergie choisie au Pokémon cible.
 * Toutes les Énergies déplacées vont sur LE MÊME Pokémon.
 *
 * Si les Énergies restantes sont toutes du même type,
 * la suivante est attachée automatiquement (pas de choix à faire).
 */
export function applyKOEnergyMove(
  deps: KOEnergyMoveDeps,
  pending: PendingKOEnergyMove,
  energy: EnergyType,
  cellName: string
): void {
  const {
    board,
    setBoard,
    setMessage,
    setPendingKOEnergyMove,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
  } = deps;

  const target = board[cellName];

  if (!target || target.owner !== pending.player) {
    setPendingKOEnergyMove(null);
    setMessage("Le Pokémon qui devait recevoir les Énergies n'est plus en jeu.");
    return;
  }

  const available = [...pending.availableEnergies];
  const moved: EnergyType[] = [];

  const takeEnergy = (energyToTake: EnergyType) => {
    const index = available.indexOf(energyToTake);

    if (index !== -1) {
      available.splice(index, 1);
      moved.push(energyToTake);
    }
  };

  takeEnergy(energy);

  let remaining = pending.remaining - 1;

  // Énergies restantes toutes identiques : pas besoin de choisir.
  while (remaining > 0 && available.length > 0 && new Set(available).size === 1) {
    takeEnergy(available[0]);
    remaining -= 1;
  }

  // Ajoute les Énergies au Pokémon choisi.
  setBoard((previousBoard) => {
    const currentTarget = previousBoard[cellName];

    if (!currentTarget) {
      return previousBoard;
    }

    return {
      ...previousBoard,
      [cellName]: {
        ...currentTarget,
        energies: [...currentTarget.energies, ...moved],
      },
    };
  });

  // Retire ces Énergies de la défausse (une occurrence par Énergie).
  const removeFromDiscard = (discard: EnergyType[]) => {
    const newDiscard = [...discard];

    for (const movedEnergy of moved) {
      const index = newDiscard.indexOf(movedEnergy);

      if (index !== -1) {
        newDiscard.splice(index, 1);
      }
    }

    return newDiscard;
  };

  if (pending.player === 1) {
    setPlayer1DiscardEnergies(removeFromDiscard);
  } else {
    setPlayer2DiscardEnergies(removeFromDiscard);
  }

  const movedText = moved.join(' + ');

  if (remaining > 0 && available.length > 0) {
    setPendingKOEnergyMove({
      ...pending,
      availableEnergies: available,
      selectedEnergy: null,
      remaining,
      targetCell: cellName,
    });

    setMessage(
      `${movedText} de ${pending.sourcePokemonName} est déplacée vers ${target.card.name}. Choisis la deuxième Énergie : elle ira aussi sur ${target.card.name}.`
    );
    return;
  }

  setPendingKOEnergyMove(null);

  setMessage(
    moved.length > 1
      ? `${movedText} de ${pending.sourcePokemonName} sont déplacées vers ${target.card.name}.`
      : `${movedText} de ${pending.sourcePokemonName} est déplacée vers ${target.card.name}.`
  );
}
