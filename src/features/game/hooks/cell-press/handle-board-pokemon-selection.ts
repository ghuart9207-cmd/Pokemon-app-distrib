import type { CellPressContext } from './cell-press-context';

/** Sélection d'un de ses Pokémon sur le plateau (en désélectionnant au passage une carte de la main). */
export function handleBoardPokemonSelection(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    selectedCard,
    setMessage,
    setSelectedAttachedTool,
    setSelectedAttackIndex,
    setSelectedCard,
    setSelectedPokemonCell,
    setSelectedTrainerCard,
    setTrainerEffectActivated,
  } = context;

  const pokemon = board[cellName];

  if (!pokemon) return false;

  // On désélectionne la carte de la main, si elle était sélectionnée
  if (selectedCard) {
    setSelectedCard(null);
  }

  // On garde la règle actuelle :
  // on ne peut sélectionner pour agir
  // que sur son propre Pokémon
  if (pokemon.owner !== currentPlayer) {
    setMessage(`Ce Pokémon appartient au joueur ${pokemon.owner}.`);

    return true;
  }

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedAttachedTool(null);

  // On affiche le Pokémon du plateau
  setSelectedPokemonCell(cellName);
  setSelectedAttackIndex(null);

  setMessage(`${pokemon.card.name} sélectionné en ${cellName}.`);

  return true;
}
