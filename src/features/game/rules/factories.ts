import type {
  BoardState,
  EnergyType,
  Player,
  PlayerStatusState,
  PokemonCard,
  PokemonInPlay,
} from '@/features/game/types';

export function createEmptyBoard(): BoardState {
  const board: BoardState = {};

  ['A', 'B', 'C', 'D'].forEach((row) => {
    [1, 2, 3, 4].forEach((column) => {
      board[`${row}${column}`] = null;
    });
  });

  return board;
}

export function createNormalPlayerStatus(): PlayerStatusState {
  return {
    poisoned: false,
    poisonSourcePlayer: null,

    burned: false,
    burnSourcePlayer: null,
    burnTriggersRemaining: 0,
  };
}

type CreatePokemonInPlayOptions = {
  card: PokemonCard;
  owner: Player;
  energies: EnergyType[];
  /** Vrai pour une Invocation (posée sans Énergie, ne peut pas être ciblée par un Dresseur). */
  isInvocation?: boolean;
};

/** Crée un Pokémon fraîchement posé sur le plateau, sans aucun statut ni effet en cours. */
export function createPokemonInPlay({
  card,
  owner,
  energies,
  isInvocation,
}: CreatePokemonInPlayOptions): PokemonInPlay {
  return {
    card,
    owner,
    currentHp: card.maxHp,
    energies,
    ...(isInvocation ? { isInvocation: true } : {}),
    attachedTool: null,
    hasAttacked: false,
    hasRetreated: false,

    attackDamageReduction: 0,
    attackDamageReductionEndPlayer: null,

    poisoned: false,
    poisonSourcePlayer: null,

    burned: false,
    burnSourcePlayer: null,
    burnTriggersRemaining: 0,

    paralyzed: false,
    paralysisTurnsRemaining: 0,

    confused: false,
    confusionTurnsRemaining: 0,

    asleep: false,
    sleepSourcePlayer: null,
    sleepEndPlayer: null,

    coinHistory: {},
  };
}
