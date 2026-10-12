import type { CoinConditionalDamage, CoinConditionalEffect, CoinSide } from './coins';
import type { CardVariant, EnergyType, Stage } from './core';

export type PokemonTalent = {
  name: string;

  type: 'passive' | 'activated';

  effect:
    | 'blockBaseAttacks'
    | 'preventDamageFromType'
    | 'damageOpponentOnPlay'
    | 'surviveKOOnCoin'
    | 'preventAllEffectsFromExGx';

  blockedType?: EnergyType;

  amount?: number;

  description: string;
};

export type AttackEffect = {
  type:
    | 'heal'
    | 'discardEnergy'
    | 'recoverEnergy'
    | 'recoverEnergyToBench'
    | 'switchWithBench'
    | 'discardTypedEnergy'
    | 'recoil'
    | 'poison'
    | 'burn'
    | 'paralyze'
    | 'confuse'
    | 'sleep'
    | 'discardAllTypedEnergyForBonus'
    | 'reduceDamageNextOpponentTurn'
    | 'takeExtraDamageNextTurn'
    | 'healAllOwnAndReturnSelf'
    | 'healSelfByDamageDealt'
    | 'forceOpponentActiveSwitch'
    | 'preventAllAttackDamageAndEffectsNextOpponentTurn'
    | 'attachEnergyToBench';
    

  amount: number;

  energyType?: EnergyType;
};

export type Attack = {
  name: string;
  damage: number;
  energyCost: number;

  requiredEnergies?: Partial<Record<EnergyType, number>>;

  effects?: AttackEffect[];

  effectText?: string;

  bonusDamageEveryTwoRounds?: number;

  coinCount?: number;

  coinEffects?: CoinConditionalEffect[];

  coinDamageEffects?: CoinConditionalDamage[];

  damagePerFace?: number;
  damagePerPile?: number;

  bonusDamagePerOpponentBenchPokemon?: number;

  bonusDamagePerOwnDiscardCard?: {
  cardId: string;
  amount: number;
};

  benchDamageSameTypeAsTarget?: number;

  ownBenchDamage?: number;

  blocksNextOwnTurn?: boolean;

  fixedDamage?: number;

  failsOn?: CoinSide;

  targetMode?: 'normal' | 'anyOpponentPokemon' | 'damagedOpponentOrPlayer';

  secondaryBenchOrPlayerDamage?: number;

  bonusDamageIfSwitchedRecently?: number;

  bonusDamageIfTargetEvolved?: number;
};

export type PokemonCard = {
  id: string;
  name: string;
  stage: Stage;
  variant: CardVariant;
  type: EnergyType;
  maxHp: number;
  retreatCost: number;
  attacks: Attack[];
  artwork?: any;
  talent?: PokemonTalent;
};

export type AttackPath = string[];

export type TrainerCard = {
  id: string;
  name: string;
  category: 'objet' | 'supporter';
  subtype?: 'normal' | 'outil';
  description: string;
  effect:
    | 'heal30'
    | 'heal20'
    | 'none'
    | 'toolHp40'
    | 'returnPokemonToHand'
    | 'bothPlayersSwitch'
    | 'healWaterEnergy50'
    | 'attach2FireEndTurn'
    | 'forceOpponentThenSelfSwitch'
    | 'moveEnergyOnKO'
    | 'coinReturnPokemonToHand'
    | 'summonTwoBase60';

  coinCount?: number;

  artwork?: any;
};

export type GameCard = PokemonCard | TrainerCard;
