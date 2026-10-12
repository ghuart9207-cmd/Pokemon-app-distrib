import {
  createPokemonInPlay,
  getKOPenalty,
  getOpponentPlacementDamage,
  getPassiveEnergyLimit,
} from '@/features/game/rules';
import type { EnergyType, PokemonInPlay } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/** Pose sur une case vide du Pokémon sélectionné dans la main. */
export function handlePokemonPlacement(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    getPokemonLockKey,
    hasPlacedThisTurn,
    pokemonPlacementLocks,
    round,
    selectedCard,
    setBoard,
    setHasPlacedThisTurn,
    setMessage,
    setPlayer1Damage,
    setPlayer1Discard,
    setPlayer1DiscardEnergies,
    setPlayer1Hand,
    setPlayer2Damage,
    setPlayer2Discard,
    setPlayer2DiscardEnergies,
    setPlayer2Hand,
    setSelectedCard,
  } = context;

  const pokemon = board[cellName];

  if (!selectedCard) return false;

  const placementLockKey = getPokemonLockKey(currentPlayer, selectedCard.id);

  const lockedUntilRound = pokemonPlacementLocks[placementLockKey];

  if (lockedUntilRound !== undefined && round <= lockedUntilRound) {
    setMessage(`${selectedCard.name} ne peut pas encore être rejoué.`);

    return true;
  }
  if (hasPlacedThisTurn) {
    setMessage('Tu as déjà posé un Pokémon pendant ce tour.');
    return true;
  }

  const allowedRow = currentPlayer === 1 ? 'B' : 'C';

  if (!cellName.startsWith(allowedRow)) {
    setMessage(
      `Le joueur ${currentPlayer} peut poser uniquement sur ${allowedRow}1 à ${allowedRow}4.`
    );
    return true;
  }

  if (pokemon !== null) {
    setMessage(`${cellName} est déjà occupée.`);
    return true;
  }

  const passiveEnergyLimit = getPassiveEnergyLimit(selectedCard);

  const startingEnergyCount = Math.min(2, passiveEnergyLimit);

  const startingEnergies: EnergyType[] = Array(startingEnergyCount).fill(
    selectedCard.type
  );

  const pokemonToPlace = createPokemonInPlay({
    card: selectedCard,
    owner: currentPlayer,
    energies: startingEnergies,
  });

  const placementDamage = getOpponentPlacementDamage(board, currentPlayer);

  const pokemonAfterPlacementDamage: PokemonInPlay = {
    ...pokemonToPlace,

    currentHp: pokemonToPlace.currentHp - placementDamage,
  };

  const knockedOutOnPlacement = pokemonAfterPlacementDamage.currentHp <= 0;

  if (knockedOutOnPlacement) {
    // Le Pokémon est K.O. immédiatement
    setBoard((previousBoard) => ({
      ...previousBoard,
      [cellName]: null,
    }));

    const penalty = getKOPenalty(selectedCard.stage, selectedCard.variant);

    if (currentPlayer === 1) {
      setPlayer1Damage((damage) => damage + penalty);

      setPlayer1Discard((discard) => [...discard, selectedCard]);

      setPlayer1DiscardEnergies((discard) => [...discard, ...pokemonToPlace.energies]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);

      setPlayer2Discard((discard) => [...discard, selectedCard]);

      setPlayer2DiscardEnergies((discard) => [...discard, ...pokemonToPlace.energies]);
    }
  } else {
    setBoard((previousBoard) => ({
      ...previousBoard,

      [cellName]: pokemonAfterPlacementDamage,
    }));
  }

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedCard.id));
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedCard.id));
  }

  setHasPlacedThisTurn(true);

  if (knockedOutOnPlacement) {
    setMessage(
      `${selectedCard.name} est posé en ${cellName}, subit ${placementDamage} dégâts à cause d'un Talent adverse et est K.O. !`
    );
  } else if (placementDamage > 0) {
    setMessage(
      `${selectedCard.name} est posé en ${cellName} avec 2 Énergies et subit ${placementDamage} dégâts à cause d'un Talent adverse.`
    );
  } else {
    setMessage(`${selectedCard.name} est posé en ${cellName} avec 2 Énergies.`);
  }

  setSelectedCard(null);
  return true;
}
