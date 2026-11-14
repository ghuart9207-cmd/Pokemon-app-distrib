
import type { CellPressContext } from './cell-press-context';

/** Choix du Pokémon de banc auquel attacher l'Énergie d'une attaque. */
export function handleBenchEnergyAttachment(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    pendingBenchEnergyAttachment,
    player1DiscardEnergies,
    player2DiscardEnergies,
    setBoard,
    setMessage,
    setPendingBenchEnergyAttachment,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
  } = context;

  if (!pendingBenchEnergyAttachment) return false;

  const pokemon = board[cellName];

  if (!pokemon) {
    setMessage('Choisis un Pokémon de banc.');
    return true;
  }

  if (pokemon.owner !== pendingBenchEnergyAttachment.player) {
    setMessage('Tu dois choisir l’un de tes Pokémon.');
    return true;
  }

  if (cellName === pendingBenchEnergyAttachment.attackerCell) {
    setMessage(
      `${pokemon.card.name} est le Pokémon actif et ne peut pas recevoir cette Énergie.`
    );
    return true;
  }

  const energyType = pendingBenchEnergyAttachment.energyType;

  const discardEnergies =
    pendingBenchEnergyAttachment.player === 1
      ? player1DiscardEnergies
      : player2DiscardEnergies;

  const energyIndex = discardEnergies.findIndex(
    (energy) => energy === energyType
  );

  if (energyIndex === -1) {
    setMessage(
      `Il n'y a plus d'Énergie ${energyType} dans la défausse.`
    );

    setPendingBenchEnergyAttachment(null);
    return true;
  }

  const newDiscard = [...discardEnergies];
  const recoveredEnergy = newDiscard[energyIndex];

  newDiscard.splice(energyIndex, 1);

  setBoard((previousBoard) => ({
    ...previousBoard,
    [cellName]: {
      ...pokemon,
      energies: [...pokemon.energies, recoveredEnergy],
    },
  }));

  if (pendingBenchEnergyAttachment.player === 1) {
    setPlayer1DiscardEnergies(newDiscard);
  } else {
    setPlayer2DiscardEnergies(newDiscard);
  }

  setMessage(
    `🔥 Une Énergie Feu a été attachée à ${pokemon.card.name}.`
  );

  setPendingBenchEnergyAttachment(null);

  return true;
}

