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
    freeReplacementTokens,
    setFreeReplacementTokens,
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
    setPendingDragonEnergyChoices,
  } = context;

  const pokemon = board[cellName];

  if (!selectedCard) return false;

  const placementLockKey = getPokemonLockKey(currentPlayer, selectedCard.id);

  const lockedUntilRound = pokemonPlacementLocks[placementLockKey];

  if (lockedUntilRound !== undefined && round <= lockedUntilRound) {
    setMessage(`${selectedCard.name} ne peut pas encore être rejoué.`);

    return true;
  }

  // Pokémon renvoyé en main par Margie ou Super Rappel :
  // repose gratuite, en plus de la pose du tour, mais sans Énergie.
  const isFreeReplacement = (freeReplacementTokens[placementLockKey] ?? 0) > 0;

  if (hasPlacedThisTurn && !isFreeReplacement) {
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

  
const isDragonWithChoices =
  selectedCard.type === 'dragon' &&
  selectedCard.dragonEnergyTypes?.length === 2;

const startingEnergies: EnergyType[] =
  isFreeReplacement || isDragonWithChoices
    ? []
    : Array(startingEnergyCount).fill(selectedCard.type);

const energyLabel = isFreeReplacement
  ? 'sans Énergie (repose gratuite)'
  : `avec ${startingEnergies.length || startingEnergyCount} Énergies`;


  
const pokemonToPlace: PokemonInPlay = {
  ...createPokemonInPlay({
    card: selectedCard,
    owner: currentPlayer,
    energies: startingEnergies,
  }),

  // Protection temporaire accordée à la pose.
  preventAllAttackDamageAndEffects:
    selectedCard.talent?.type === 'passive' &&
    selectedCard.talent.effect ===
      'preventAllAttackDamageAndEffectsOnPlayUntilOpponentTurnEnd',

  // La protection expire à la fin du prochain tour adverse.
  preventAllAttackDamageAndEffectsEndPlayer:
    selectedCard.talent?.type === 'passive' &&
    selectedCard.talent.effect ===
      'preventAllAttackDamageAndEffectsOnPlayUntilOpponentTurnEnd'
      ? (currentPlayer === 1 ? 2 : 1)
      : null,
};


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
    // Talent : paralyse le Pokémon adverse en face
    // lors de la pose sur le plateau.
    const paralysisOnPlay =
      selectedCard.talent?.type === 'passive' &&
      selectedCard.talent.effect ===
        'paralyzeOpponentOnPlay';

    



const column = cellName.slice(1);

const targetCells =
  currentPlayer === 1
    ? [`C${column}`, `D${column}`]
    : [`B${column}`, `A${column}`];

const oppositeCell = targetCells.find(
  (cell) =>
    board[cell] !== null &&
    board[cell] !== undefined &&
    board[cell]?.owner !== currentPlayer
);

const target = oppositeCell
  ? board[oppositeCell]
  : null;



    
const canParalyze =
  paralysisOnPlay &&
  target !== null &&
  target !== undefined &&
  target.owner !== currentPlayer;


    setBoard((previousBoard) => {
      const updatedBoard = {
        ...previousBoard,
        [cellName]: pokemonAfterPlacementDamage,
      };

      const target = oppositeCell
  ? previousBoard[oppositeCell]
  : null;

      if (
  canParalyze &&
  oppositeCell &&
  target &&
  target.owner !== currentPlayer
) {
        updatedBoard[oppositeCell] = {
          ...target,
          paralyzed: true,
          paralysisTurnsRemaining: 1,
        };
      }

      return updatedBoard;
    });
  }


// Demande les deux choix d'énergie à la pose
// uniquement si le Dragon a survécu.
if (
  !knockedOutOnPlacement &&
  !isFreeReplacement &&
  isDragonWithChoices &&
  startingEnergyCount > 0
) {
  setPendingDragonEnergyChoices((previous) => [
    ...previous,
    {
      cellName,
      player: currentPlayer,
      remaining: startingEnergyCount,
    },
  ]);
}

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedCard.id));
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedCard.id));
  }

  if (isFreeReplacement) {
    // On consomme la repose gratuite,
    // sans utiliser la pose normale du tour.
    setFreeReplacementTokens((previous) => {
      const remaining = (previous[placementLockKey] ?? 0) - 1;
      const next = { ...previous };

      if (remaining > 0) {
        next[placementLockKey] = remaining;
      } else {
        delete next[placementLockKey];
      }

      return next;
    });
  } else {
    setHasPlacedThisTurn(true);
  }

  if (knockedOutOnPlacement) {
    setMessage(
      `${selectedCard.name} est posé en ${cellName}, subit ${placementDamage} dégâts à cause d'un Talent adverse et est K.O. !`
    );
  } else if (placementDamage > 0) {
    setMessage(
      `${selectedCard.name} est posé en ${cellName} ${energyLabel} et subit ${placementDamage} dégâts à cause d'un Talent adverse.`
    );
  
  } else {
    const oppositeCell =
      `${currentPlayer === 1 ? 'C' : 'B'}${cellName.slice(1)}`;

    const target = board[oppositeCell];

    const paralysisTriggered =
      selectedCard.talent?.type === 'passive' &&
      selectedCard.talent.effect ===
        'paralyzeOpponentOnPlay' &&
      target !== null &&
      target !== undefined &&
      target.owner !== currentPlayer;

    setMessage(
      paralysisTriggered
        ? `${selectedCard.name} est posé en ${cellName}. Son Talent paralyse ${target!.card.name} en ${oppositeCell} !`
        : `${selectedCard.name} est posé en ${cellName} ${energyLabel}.`
    );
  }


  setSelectedCard(null);
  return true;
}
