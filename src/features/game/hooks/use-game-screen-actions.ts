import type { PendingKOEnergyMove, Player, PokemonInPlay } from '@/features/game/types';
import type { GameState } from './state/use-game-state';

type GameScreenActionsOptions = Pick<
  GameState,
  | 'board'
  | 'player1Discard'
  | 'player2Discard'
  | 'openedDiscardPlayer'
  | 'selectedPokemonCell'
  | 'selectedAttachedTool'
  | 'setOpenedDiscardPlayer'
  | 'setSelectedAttachedTool'
  | 'setSelectedPokemonCell'
  | 'setSelectedAttackIndex'
  | 'setPendingKOEnergyMove'
  | 'setPendingInvocationPlacement'
  | 'setMessage'
> & {
  endTurn: () => void;
};

/** Petits handlers qui relient les composants de l'écran de jeu à l'état. */
export function useGameScreenActions({
  board,
  player1Discard,
  player2Discard,
  openedDiscardPlayer,
  selectedPokemonCell,
  selectedAttachedTool,
  setOpenedDiscardPlayer,
  setSelectedAttachedTool,
  setSelectedPokemonCell,
  setSelectedAttackIndex,
  setPendingKOEnergyMove,
  setPendingInvocationPlacement,
  setMessage,
  endTurn,
}: GameScreenActionsOptions) {
  const selectedPokemon = selectedPokemonCell ? board[selectedPokemonCell] : null;
  const openedDiscardCards = openedDiscardPlayer === 1 ? player1Discard : player2Discard;

  function handleToggleDiscard(player: Player) {
    setOpenedDiscardPlayer((previous) => (previous === player ? null : player));
  }

  function handleCloseDiscardPreview() {
    setOpenedDiscardPlayer(null);
  }

  /** Sélectionne (ou désélectionne) l'Outil attaché à un Pokémon pour l'afficher. */
  function handleToolPress(cellName: string, pokemon: PokemonInPlay) {
    const tool = pokemon.attachedTool;

    if (!tool) return;

    if (selectedAttachedTool?.cellName === cellName) {
      setSelectedAttachedTool(null);
      return;
    }

    setSelectedAttachedTool({ card: tool, cellName });
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
  }

  function handleSelectKOEnergy(energy: PendingKOEnergyMove['selectedEnergy']) {
    setPendingKOEnergyMove((previous) =>
      previous ? { ...previous, selectedEnergy: energy } : null
    );
  }

  function handleSelectInvocation(index: number) {
    setPendingInvocationPlacement((previous) =>
      previous ? { ...previous, selectedIndex: index } : null
    );
  }

  function handleSelectAttack(index: number, attackMessage: string) {
    setSelectedAttackIndex(index);
    setMessage(attackMessage);
  }

  // `endTurn` est enveloppé pour ne pas recevoir l'événement de clic en argument.
  function handleEndTurn() {
    endTurn();
  }

  return {
    selectedPokemon,
    openedDiscardCards,
    handleToggleDiscard,
    handleCloseDiscardPreview,
    handleToolPress,
    handleSelectKOEnergy,
    handleSelectInvocation,
    handleSelectAttack,
    handleEndTurn,
  };
}
