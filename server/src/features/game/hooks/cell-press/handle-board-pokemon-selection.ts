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
    setInspectedPokemonCell,
    setInspectedHandCard,
  } = context;

  const pokemon = board[cellName];

  if (!pokemon) return false;

  // On désélectionne la carte de la main, si elle était sélectionnée
  if (selectedCard) {
    setSelectedCard(null);
  }

  setInspectedHandCard(null);

  // Pokémon de l'adversaire : on peut le CONSULTER (attaques, Talent,
  // Invocation choisie…) mais pas l'utiliser.
  if (pokemon.owner !== currentPlayer) {
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
    setSelectedTrainerCard(null);
    setTrainerEffectActivated(false);
    setInspectedPokemonCell(cellName);
    setMessage(
      `${pokemon.card.name} appartient au joueur ${pokemon.owner} : consultation seulement.`
    );

    return true;
  }

  setInspectedPokemonCell(null);

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedAttachedTool(null);

  // On affiche le Pokémon du plateau
  setSelectedPokemonCell(cellName);
  setSelectedAttackIndex(null);

  setMessage(`${pokemon.card.name} sélectionné en ${cellName}.`);

  return true;
}
