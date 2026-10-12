import type { PokemonCard, TrainerCard } from './cards';
import type { CoinHistory } from './coins';
import type { EnergyType, Player } from './core';

export type PlayerStatusState = {
  poisoned: boolean;
  poisonSourcePlayer: Player | null;

  burned: boolean;
  burnSourcePlayer: Player | null;
  burnTriggersRemaining: number;

  extraDamageNextTurn?: number;

  extraDamageNextTurnSourcePlayer?: Player | null;

  extraDamageNextTurnReady?: boolean;
};

export type PokemonInPlay = {
  card: PokemonCard;
  owner: Player;
  currentHp: number;
  energies: EnergyType[];
  attachedTool: TrainerCard | null;
  hasAttacked: boolean;
  hasRetreated: boolean;
  isInvocation?: boolean;

  lastSwitchedTurnId?: number;

  poisoned: boolean;
  poisonSourcePlayer: Player | null;

  burned: boolean;
  burnSourcePlayer: Player | null;
  burnTriggersRemaining: number;
  paralyzed: boolean;
  paralysisTurnsRemaining: number;

  confused: boolean;
  confusionTurnsRemaining: number;

  asleep: boolean;
  sleepSourcePlayer: Player | null;
  sleepEndPlayer: Player | null;

  coinHistory: CoinHistory;

  extraDamageNextTurn?: number;

  extraDamageNextTurnSourcePlayer?: Player | null;

  extraDamageNextTurnReady?: boolean;

  blockedAttackName?: string | null;
  blockedAttackTurnId?: number | null;

  attackDamageReduction?: number;

  attackDamageReductionEndPlayer?: Player | null;

  preventAllAttackDamageAndEffects?: boolean;
preventAllAttackDamageAndEffectsEndPlayer?: Player | null;
};

export type BoardState = Record<string, PokemonInPlay | null>;
