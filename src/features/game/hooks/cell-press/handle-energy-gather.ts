import type { BoardState, EnergyType, PendingEnergyGather, PokemonInPlay } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/**
 * Déplacer des Énergies de ses autres Pokémon vers un Pokémon, une par clic :
 * - Talent 'gatherEnergyOnPlayThenSwitch' (à la pose) : Énergies d'un type précis ;
 * - effet d'attaque 'gatherEnergyFromBench' : n'importe quel type. Si le Pokémon cliqué
 *   a plusieurs types d'Énergies, le joueur choisit lequel (boutons sous la carte).
 * On termine avec le bouton « Terminer » / « Fin de l'effet ».
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
  const typeText = pending.energyType ? ` ${pending.energyType}` : '';

  if (!source || source.owner !== pending.player || cellName === pending.targetCell) {
    setMessage(
      `${pending.talentName} : clique sur l'un de tes autres Pokémon pour déplacer 1 Énergie${typeText} vers ${receiver.card.name}, ou appuie sur « ${pending.fromAttack ? "Fin de l'effet" : 'Terminer'} ».`
    );
    return true;
  }

  // Types d'Énergies que ce Pokémon peut donner.
  const availableTypes = [...new Set(source.energies)].filter(
    (energy) => !pending.energyType || energy === pending.energyType
  );

  if (availableTypes.length === 0) {
    setMessage(`${source.card.name} n'a pas d'Énergie${typeText} à déplacer.`);
    return true;
  }

  // Plusieurs types : le joueur choisit lequel (comme Relais Optimiste).
  if (availableTypes.length > 1) {
    setPendingEnergyGather({ ...pending, sourceCell: cellName, choiceTypes: availableTypes });
    setMessage(`${pending.talentName} : choisis le type d'Énergie de ${source.card.name} à déplacer.`);
    return true;
  }

  moveOneEnergy(context, pending, cellName, source, receiver, availableTypes[0]);
  return true;
}

/** Choix du type d'Énergie quand le Pokémon cliqué en a plusieurs. */
export function selectEnergyGatherType(
  context: Pick<
    CellPressContext,
    'board' | 'pendingEnergyGather' | 'setPendingEnergyGather' | 'setBoard' | 'setMessage'
  >,
  energy: EnergyType
) {
  const pending = context.pendingEnergyGather;
  if (!pending?.sourceCell) return;

  const source = context.board[pending.sourceCell];
  const receiver = context.board[pending.targetCell];

  if (!source || !receiver || !source.energies.includes(energy)) {
    context.setPendingEnergyGather({ ...pending, sourceCell: null, choiceTypes: undefined });
    return;
  }

  moveOneEnergy(context, pending, pending.sourceCell, source, receiver, energy);
}

function moveOneEnergy(
  context: Pick<CellPressContext, 'setPendingEnergyGather' | 'setBoard' | 'setMessage'>,
  pending: PendingEnergyGather,
  sourceCell: string,
  source: PokemonInPlay,
  receiver: PokemonInPlay,
  energy: EnergyType
) {
  const sourceEnergies = [...source.energies];
  sourceEnergies.splice(sourceEnergies.lastIndexOf(energy), 1);

  context.setBoard((previousBoard: BoardState) => {
    const currentSource = previousBoard[sourceCell];
    const currentReceiver = previousBoard[pending.targetCell];

    if (!currentSource || !currentReceiver) return previousBoard;

    return {
      ...previousBoard,
      [sourceCell]: { ...currentSource, energies: sourceEnergies },
      [pending.targetCell]: {
        ...currentReceiver,
        energies: [...currentReceiver.energies, energy],
      },
    };
  });

  const moved = pending.moved + 1;
  context.setPendingEnergyGather({ ...pending, moved, sourceCell: null, choiceTypes: undefined });

  context.setMessage(
    `1 Énergie ${energy} de ${source.card.name} passe sur ${receiver.card.name} (${moved} déplacée(s)). Continue ou appuie sur « ${pending.fromAttack ? "Fin de l'effet" : 'Terminer'} ».`
  );
}
