import type { CellPressContext } from './cell-press/cell-press-context';
import { handleAttachedToolClick } from './cell-press/handle-attached-tool-click';
import { handleBenchEnergyAttachment } from './cell-press/handle-bench-energy-attachment';
import { handleBoardPokemonSelection } from './cell-press/handle-board-pokemon-selection';
import { handleBothPlayersSwitch } from './cell-press/handle-both-players-switch';
import { handleCoinReturnToHand } from './cell-press/handle-coin-return-to-hand';
import { handleScriptTarget } from './cell-press/handle-script-target';
import { handlePendingTrainerEffect } from './cell-press/handle-pending-trainer-effect';
import { handleEmptyCell } from './cell-press/handle-empty-cell';
import { handleGeneratedBenchEnergy } from './cell-press/handle-generated-bench-energy';
import { handleTalentEnergyAttachment } from './cell-press/handle-talent-energy-attachment';
import { handleDamageCounterMove } from './cell-press/handle-damage-counter-move';
import { handleTalentHeal } from './cell-press/handle-talent-heal';
import { handleTalentToolReturn } from './cell-press/handle-talent-tool-return';
import { handleDiscardSummonPlacement } from './cell-press/handle-discard-summon-placement';
import { handleOwnBenchDamage } from './cell-press/handle-own-bench-damage';
import { handleEnergyGather } from './cell-press/handle-energy-gather';
import { handleCountersToActive } from './cell-press/handle-counters-to-active';
import { handleInvocationPlacement } from './cell-press/handle-invocation-placement';
import { handleKOEnergyMove } from './cell-press/handle-ko-energy-move';
import { handleOpponentActiveSwitch } from './cell-press/handle-opponent-active-switch';
import { handleOpponentTarget } from './cell-press/handle-opponent-target';
import { handlePokemonPlacement } from './cell-press/handle-pokemon-placement';
import { handlePokemonSwitch } from './cell-press/handle-pokemon-switch';
import { handleTrainerCardTarget } from './cell-press/handle-trainer-card-target';
import { handleEnergyTransferToBench } from './cell-press/handle-energy-transfer-to-bench';
import { handleDiscardTalentPlacement } from './cell-press/handle-discard-talent-placement';
import { handleAttackSummonPlacement } from './cell-press/handle-attack-summon-placement';


/**
 * Handlers essayés dans l'ordre : le premier qui traite le clic (renvoie `true`) arrête la chaîne.
 * L'ordre reproduit la priorité des actions en attente sur une case du plateau.
 */
const CELL_PRESS_HANDLERS = [
  // Code des cartes : prioritaire pendant un script.
  handleScriptTarget,
  handleDiscardTalentPlacement,
  handleInvocationPlacement,
  handleTalentEnergyAttachment,
  handleDamageCounterMove,
  handleTalentHeal,
  handleTalentToolReturn,
  handleDiscardSummonPlacement,
  handleOwnBenchDamage,
  handleEnergyGather,
  handleCountersToActive,
  handleGeneratedBenchEnergy,
  handleOpponentActiveSwitch,
  handleCoinReturnToHand,
  handlePendingTrainerEffect,
  handleKOEnergyMove,
  handleBothPlayersSwitch,
  handleAttachedToolClick,
  handleOpponentTarget,
  handlePokemonSwitch,
  handleBenchEnergyAttachment,
  handleTrainerCardTarget,
  handleEnergyTransferToBench,
  // Après les autres actions en attente : elles se résolvent d'abord.
  handleAttackSummonPlacement,
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
