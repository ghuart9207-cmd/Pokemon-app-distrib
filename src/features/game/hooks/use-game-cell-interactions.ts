import type { CellPressContext } from './cell-press/cell-press-context';
import { handleAttachedToolClick } from './cell-press/handle-attached-tool-click';
import { handleBenchEnergyAttachment } from './cell-press/handle-bench-energy-attachment';
import { handleBoardPokemonSelection } from './cell-press/handle-board-pokemon-selection';
import { handleBothPlayersSwitch } from './cell-press/handle-both-players-switch';
import { handleCoinReturnToHand } from './cell-press/handle-coin-return-to-hand';
import { handleEmptyCell } from './cell-press/handle-empty-cell';
import { handleGeneratedBenchEnergy } from './cell-press/handle-generated-bench-energy';
import { handleInvocationPlacement } from './cell-press/handle-invocation-placement';
import { handleKOEnergyMove } from './cell-press/handle-ko-energy-move';
import { handleOpponentActiveSwitch } from './cell-press/handle-opponent-active-switch';
import { handleOpponentTarget } from './cell-press/handle-opponent-target';
import { handlePokemonPlacement } from './cell-press/handle-pokemon-placement';
import { handlePokemonSwitch } from './cell-press/handle-pokemon-switch';
import { handleTrainerCardTarget } from './cell-press/handle-trainer-card-target';

/**
 * Handlers essayés dans l'ordre : le premier qui traite le clic (renvoie `true`) arrête la chaîne.
 * L'ordre reproduit la priorité des actions en attente sur une case du plateau.
 */
const CELL_PRESS_HANDLERS = [
  handleInvocationPlacement,
  handleGeneratedBenchEnergy,
  handleOpponentActiveSwitch,
  handleCoinReturnToHand,
  handleKOEnergyMove,
  handleBothPlayersSwitch,
  handleAttachedToolClick,
  handleOpponentTarget,
  handlePokemonSwitch,
  handleBenchEnergyAttachment,
  handleTrainerCardTarget,
  handleBoardPokemonSelection,
  handlePokemonPlacement,
  handleEmptyCell,
];

export function useGameCellInteractions(context: CellPressContext) {
  function handleCellPress(cellName: string) {
    if (context.gameOver) return;

    for (const handler of CELL_PRESS_HANDLERS) {
      if (handler(context, cellName)) return;
    }
  }

  return { handleCellPress };
}
