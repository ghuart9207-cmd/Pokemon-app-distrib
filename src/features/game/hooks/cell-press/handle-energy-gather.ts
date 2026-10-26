import type { CellPressContext } from './cell-press-context';

/**
 * Talent 'gatherEnergyOnPlayThenSwitch' (à la pose depuis la main) :
 * chaque clic sur l'un de VOS autres Pokémon déplace 1 Énergie du type voulu
 * vers le Pokémon qui vient d'être posé. On termine avec le bouton « Terminer ».
 */
export function handleEnergyGather(context: CellPressContext, cellName: string): boolean {
  const {
    board,
    currentPlayer,
    turnId,
    pendingEnergyGather,
    setPendingEnergyGather,
    setBoard,
    setMessage,
  } = context;

  if (!pendingEnergyGather) return false;

  const pending = pendingEnergyGather;

  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingEnergyGather(null);
    return false;
  }

  const receiver = board[pending.targetCell];

  if (!receiver) {
    setPendingEnergyGather(null);
    setMessage("Le Pokémon qui devait recevoir les Énergies n'est plus en jeu.");
    return true;
  }

  const source = board[cellName];

  if (!source || source.owner !== pending.player || cellName === pending.targetCell) {
    setMessage(
      `${pending.talentName} : clique sur l'un de tes autres Pokémon pour déplacer 1 Énergie ${pending.energyType} vers ${receiver.card.name}, ou appuie sur « Terminer ».`
    );
    return true;
  }

  const energyIndex = source.energies.lastIndexOf(pending.energyType);

  if (energyIndex === -1) {
    setMessage(`${source.card.name} n'a pas d'Énergie ${pending.energyType}.`);
    return true;
  }

  const sourceEnergies = [...source.energies];
  sourceEnergies.splice(energyIndex, 1);

  setBoard((previousBoard) => {
    const currentSource = previousBoard[cellName];
    const currentReceiver = previousBoard[pending.targetCell];

    if (!currentSource || !currentReceiver) return previousBoard;

    return {
      ...previousBoard,
      [cellName]: { ...currentSource, energies: sourceEnergies },
      [pending.targetCell]: {
        ...currentReceiver,
        energies: [...currentReceiver.energies, pending.energyType],
      },
    };
  });

  const moved = pending.moved + 1;
  setPendingEnergyGather({ ...pending, moved });

  setMessage(
    `1 Énergie ${pending.energyType} de ${source.card.name} passe sur ${receiver.card.name} (${moved} déplacée(s)). Continue ou appuie sur « Terminer ».`
  );

  return true;
}
