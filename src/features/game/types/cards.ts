import type { CoinConditionalDamage, CoinConditionalEffect, CoinSide } from './coins';
import type { CardVariant, EnergyType, SpecialCondition, Stage } from './core';

export type PokemonTalent = {
  name: string;

  type: 'passive' | 'activated';

  effect:
    | 'blockBaseAttacks'
    | 'preventDamageFromType'
    | 'damageOpponentOnPlay'
    | 'paralyzeOpponentOnPlay'
    | 'applyConditionsToOpponentOnPlay'
    | 'surviveKOOnCoin'
    | 'preventAllEffectsFromExGx'
    | 'reduceDamageFromFireWater'
    | 'reduceAllAttackDamage'
    | 'invertImposedAttackCoinFlipOncePerTurn'
    | 'freeRetreatOnFirstTurn'
    | 'attachEnergyOncePerTurn'
    | 'moveDamageCounterOncePerTurn'
    | 'swapWithCardFromHand'
    | 'gatherEnergyOnPlayThenSwitch'
    | 'increaseOpponentPoisonDamage'
    | 'useBasicPokemonDiscardAttacks'
    | 'recoverFromDiscardOncePerGame'
    | 'preventAllAttackDamageAndEffectsOnPlayUntilOpponentTurnEnd';

  blockedType?: EnergyType;
 
energyType?: EnergyType;

targetPokemonType?: EnergyType;

  amount?: number;

  // Talent 'swapWithCardFromHand' : id de la carte de la main
  // avec laquelle ce Pokémon peut être échangé (ex : 'froussardinegx-001').
  swapCardId?: string;

  // Talent 'applyConditionsToOpponentOnPlay' : états spéciaux infligés
  // au Pokémon adverse en face à la pose (ex : ['poison', 'burn']).
  conditions?: SpecialCondition[];

  // Talent « déplacer un marqueur de dégâts » : si vrai, le marqueur
  // doit venir de l'un de VOS Pokémon (texte français de Lugulabre).
  fromOwnPokemonOnly?: boolean;

  description: string;
};

/**
 * Comment un Pokémon renvoyé en main par une carte peut être reposé :
 * - 'free'   : en plus de la pose normale du tour, mais sans Énergie
 *              (ex : Margie, Super Rappel) ;
 * - 'normal' : comme pose normale du tour, avec ses Énergies habituelles
 *              (ex : Papilusion).
 * Dans les deux cas, un Niveau 1 attend le prochain tour
 * et un Niveau 2 attend un tour de plus.
 */
export type ReturnToHandReplacement = 'free' | 'normal';

export type AttackEffect = {
  type:
    | 'heal'
    | 'healPokemonByType'
    | 'healSelfPerOpponentActiveEnergy'
    | 'discardEnergy'
    | 'discardOpponentActiveEnergy'
    | 'discardAllEnergyAndToolsFromBothActives'
    | 'recoverEnergy'
    | 'recoverEnergyToBench'
    | 'switchWithBench'
    | 'discardTypedEnergy'
    | 'recoil'
    | 'selfDamageEqualToDamageTaken'
    | 'poison'
    | 'burn'
    | 'paralyze'
    | 'confuse'
    | 'sleep'
    | 'discardAllTypedEnergyForBonus'
    | 'optionalBonusDamageAndOwnBenchDamage'
    | 'bonusDamagePerTargetRetreatCost'
    | 'discardAllEnergyForBonus'
    | 'reduceDamageNextOpponentTurn'
    | 'ignoreTargetDamageReduction'
    | 'takeExtraDamageNextTurn'
    | 'setNextTurnAttackBaseDamage'
    | 'healAllOwnAndReturnSelf'
    | 'healAllOwnPokemon'
    | 'returnSelfToHand'
    | 'bonusDamageIfSelfDamaged'
    | 'bonusDamageIfTargetType'
    | 'summonFromAnyDiscard'
    | 'discardOpponentActiveTool'
    | 'freeRetreatNextOwnTurn'
    | 'reduceDamagePerTargetRetreatCost'
    | 'damageOneOwnBenchPokemon'
    | 'damagePerAllBenchPokemon'
    | 'moveCountersFromOwnToOpponentActive'
    | 'damagePerSelfDamageCounter'
    | 'healSelfByDamageDealt'
    | 'forceOpponentActiveSwitch'
    | 'preventAllAttackDamageAndEffectsNextOpponentTurn'
    | 'preventOpponentPlayingItemsNextTurn'
    | 'attachEnergyToBench'
    | 'moveOwnEnergyToBench'
    | 'damageEveryoneIgnoringEffects'
    | 'bonusDamageIfToolAttached'
    | 'bonusDamagePerOpponentActiveSpecialCondition'
    | 'damageAllPokemonWithTalent'
    | 'transferAllEnergiesToBench'
    | 'preventTargetRetreatNextTurn'
    | 'blockEnergyAttachmentFromHand'
    | 'bonusDamageIfAttachedEnergy'
    | 'bonusDamageIfDefenderHasEnergy'
    | 'bonusDamageIfOpponentActiveHasEnergy'
    | 'bonusDamageIfTargetPoisoned'
    | 'damagePerAttachedEnergy'
    | 'failsIfOpponentActiveMaxHpAtLeast'
    | 'preventDamageFromStageOrVariantNextOpponentTurn'
    | 'summonPokemon'
    | 'damageAllOpponentPokemonAndPlayer'
    | 'damagePerOpponentTrainerInHand'
    | 'damagePerOwnCardInHand'
    | 'summonFromInvocationPool'
    | 'retaliateDamageNextOpponentTurn'
    | 'preventAllAttackDamageNextOpponentTurn'
    | 'preventTargetHealingNextOpponentTurn';

    

  amount: number;

  optional?: boolean;

  energyType?: EnergyType;

  pokemonType?: EnergyType;
  targetAllPokemon?: boolean;

  attackName?: string;

  blockedStage?: Stage;
  blockedVariant?: CardVariant;

  // Effet qui renvoie un Pokémon en main : mode de repose.
  // Par défaut : 'normal'.
  returnToHandReplacement?: ReturnToHandReplacement;

  // Effet 'summonFromInvocationPool' : taille de la réserve choisie
  // à la préparation (4 par défaut) et PV maximum des Invocations (60).
  poolSize?: number;
  maxHp?: number;

  // Effet 'moveCountersFromOwnToOpponentActive' : nombre de vos Pokémon
  // qui donnent des marqueurs (2 par défaut). `amount` = dégâts par Pokémon.
  pokemonCount?: number;

  // Effet 'summonPokemon' : id de la carte à invoquer.
  // Si absent, on invoque une copie du Pokémon attaquant.
  summonCardId?: string;

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

  // Nombre de pièces = nombre d'Énergies de ce type attachées
  // à l'attaquant (remplace `coinCount`). Ex : 'electrique'.
  coinCountPerAttachedEnergy?: EnergyType;

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

  bonusDamageIfTargetGx?: number;

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
    | 'summonTwoBase60'
    | 'boostPokemonAttackThisTurn';

  coinCount?: number;

  // Effet 'boostPokemonAttackThisTurn' (ex : Cynthia) :
  // pendant ce tour, l'attaque `boostAttackName` de vos Pokémon
  // dont le nom commence par `boostPokemonName` inflige `boostAmount`
  // dégâts supplémentaires.
  boostPokemonName?: string;
  boostAttackName?: string;
  boostAmount?: number;

  // Cartes qui renvoient un Pokémon en main : mode de repose.
  // Par défaut : 'normal'.
  returnToHandReplacement?: ReturnToHandReplacement;

  artwork?: any;
};

export type GameCard = PokemonCard | TrainerCard;
