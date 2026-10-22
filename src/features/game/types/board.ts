import type { PokemonCard, TrainerCard } from './cards';
import type { CoinHistory } from './coins';
import type {CardVariant,EnergyType,Player,Stage,} from './core';


export type PlayerStatusState = {
  poisoned: boolean;
  poisonSourcePlayer: Player | null;

  burned: boolean;
  burnSourcePlayer: Player | null;
  burnTriggersRemaining: number;

  itemsBlockedThisTurn?: boolean;

  extraDamageNextTurn?: number;

  extraDamageNextTurnSourcePlayer?: Player | null;

  extraDamageNextTurnReady?: boolean;
};

export type PokemonInPlay = {
  card: PokemonCard;
  owner: Player;
  currentHp: number;
  energies: EnergyType[];
  blockedHandEnergyUntilOwnTurnEnd?: boolean;
  attachedTool: TrainerCard | null;
  hasAttacked: boolean;
  hasRetreated: boolean;
  isInvocation?: boolean;
  lastUsedTalentTurnId?: number;

  lastSwitchedTurnId?: number;

  nextTurnAttackBaseDamage?: number;
  nextTurnAttackBaseDamageAttackName?: string | null;
  nextTurnAttackBaseDamageTurnId?: number | null;

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
  extraDamageNextTurnEnergyType?: EnergyType;

  blockedAttackName?: string | null;
  blockedAttackTurnId?: number | null;
  
  blockedAllAttacksTurnId?: number | null;

  
 retreatBlockedUntilOwnTurnEnd?: boolean;



  attackDamageReduction?: number;

  attackDamageReductionEndPlayer?: Player | null;

  preventAllAttackDamageAndEffects?: boolean;
preventAllAttackDamageAndEffectsEndPlayer?: Player | null;


temporaryAttackDamageProtection?: {
  stage?: Stage;
  variant?: CardVariant;
  expiresAfterPlayerTurn: Player;
};

};

export type BoardState = Record<string, PokemonInPlay | null>;
