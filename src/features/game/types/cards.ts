import type { CoinConditionalDamage, CoinConditionalEffect, CoinSide } from './coins';
import type { CardVariant, EnergyType, Stage } from './core';

export type PokemonTalent = {
  name: string;

  type: 'passive' | 'activated';

  effect:
    | 'blockBaseAttacks'
    | 'preventDamageFromType'
    | 'damageOpponentOnPlay'
    | 'paralyzeOpponentOnPlay'
    | 'surviveKOOnCoin'
    | 'preventAllEffectsFromExGx'
    | 'reduceDamageFromFireWater';

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
    | 'attachEnergyToBench'
    | 'moveOwnEnergyToBench'
    | 'damageEveryoneIgnoringEffects'
    | 'preventDamageFromStageOrVariantNextOpponentTurn';

    

  amount: number;

  energyType?: EnergyType;

  
blockedStage?: Stage;
blockedVariant?: CardVariant;

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

  recoil?: number;

  blocksNextOwnTurn?: boolean;

  
blocksAllAttacksNextOwnTurn?: boolean;


  fixedDamage?: number;

  failsOn?: CoinSide;

  targetMode?: 'normal' | 'anyOpponentPokemon' | 'damagedOpponentOrPlayer';

  secondaryBenchOrPlayerDamage?: number;

  bonusDamageIfSwitchedRecently?: number;

  bonusDamageIfTargetEvolved?: number;

  bonusDamageIfTargetNotEvolved?: number;
};

export type PokemonCard = {
  id: string;
  name: string;
  stage: Stage;
  variant: CardVariant;
  type: EnergyType;
  dragonEnergyTypes?: [EnergyType, EnergyType];
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
