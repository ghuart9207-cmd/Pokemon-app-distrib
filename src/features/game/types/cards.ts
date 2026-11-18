import type { CoinConditionalDamage, CoinConditionalEffect, CoinSide } from './coins';
import type { ScriptBlock, ScriptCardFilter, ScriptPokemonFilter } from './script';
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
    | 'reduceOpposingColumnAttackDamage'
    | 'preventDamageToTypeFromToolAttackers'
    | 'invertImposedAttackCoinFlipOncePerTurn'
    | 'freeRetreatOnFirstTurn'
    | 'freeRetreatForOwnBasePokemon'
    | 'attachEnergyOncePerTurn'
    | 'moveDamageCounterOncePerTurn'
    | 'healOwnPokemonOncePerTurn'
    | 'healAllOwnPokemonOncePerTurn'
    | 'summonOncePerTurn'
    | 'returnToolToHandOncePerTurn'
    | 'switchWithBenchOncePerTurn'
    | 'burnAttackerWhenDamagedWhileActive'
    | 'negateOpponentGxExTalents'
    | 'script'
    | 'swapWithCardFromHand'
    | 'gatherEnergyOnPlayThenSwitch'
    | 'increaseOpponentPoisonDamage'
    | 'increaseOpponentBurnDamage'
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

  // Talent 'summonOncePerTurn' : PV maximum des Pokémon invocables (60 par défaut).
  // Le type se règle avec `targetPokemonType`, le nombre avec `amount` (1 par défaut).
  maxHp?: number;

  // effect: 'script'
  // - type 'activated' : bouton « Utiliser le talent », une fois par tour, applique ce code ;
  // - type 'passive'   : les effets qui durent (retreatCost, maxHp, resistance, boost,
  //   immunity, prevent, whenDamaged) s'appliquent tant que ce Pokémon est en jeu.
  script?: ScriptBlock[];

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
    | 'bonusDamage'
    | 'bonusDamageIfExtraEnergy'
    | 'reduceTargetAttackDamageNextTurn'
    | 'gatherEnergyFromBench'
    | 'bonusDamageIfOpponentHasTypeInPlay'
    | 'swapDamageCountersWithOpponentActive'
    | 'knockOutIfOpponentActiveIsBase'
    | 'coinCheckBeforeTargetAttackNextTurn'
    | 'damagePerOpponentActiveEnergy'
    | 'healSelfByDamageDealt'
    | 'forceOpponentActiveSwitch'
    | 'preventAllAttackDamageAndEffectsNextOpponentTurn'
    | 'preventOpponentPlayingItemsNextTurn'
    | 'attachEnergyToBench'
    | 'moveOwnEnergyToBench'
    | 'damageEveryoneIgnoringEffects'
    | 'bonusDamageIfToolAttached'
    | 'bonusDamagePerOpponentActiveSpecialCondition'
    | 'bonusDamageIfOpponentActiveHasCondition'
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
    // `amount` dégâts en plus par carte de la pile de défausse ADVERSE qui respecte `cards`
    | 'damagePerOpponentDiscardCard'
    // `amount` dégâts en plus par carte de SA pile de défausse qui respecte `cards`
    | 'damagePerOwnDiscardCard'
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

  // Effets qui donnent des Énergies à un autre Pokémon (attachEnergyToBench,
  // recoverEnergyToBench, moveOwnEnergyToBench, transferAllEnergiesToBench) :
  // seul un Pokémon de ce type peut les recevoir (facultatif).
  targetPokemonType?: EnergyType;

  // Effet 'attachEnergyToBench' : `amount` Énergie(s) pour CHAQUE côté FACE
  // des pièces de l'attaque (`coinCount`), à répartir entre ses Pokémon de banc.
  perCoinFace?: boolean;

  // Effet 'bonusDamageIfExtraEnergy' : nombre d'Énergies `energyType`
  // à avoir EN PLUS du coût de l'attaque (2 par défaut).
  extraEnergyCount?: number;

  attackName?: string;

  // Effet 'bonusDamageIfOpponentActiveHasCondition' : états spéciaux qui
  // déclenchent le bonus (ex : ['poison']). Absent : n'importe lequel.
  conditions?: SpecialCondition[];

  blockedStage?: Stage;
  blockedVariant?: CardVariant;

  // Effet qui renvoie un Pokémon en main : mode de repose.
  // Par défaut : 'normal'.
  returnToHandReplacement?: ReturnToHandReplacement;

  // Effet 'summonFromInvocationPool' : taille de la réserve choisie
  // à la préparation (4 par défaut) et PV maximum des Invocations (60).
  poolSize?: number;
  maxHp?: number;

  // Code des cartes (summon avec `pokemon`) : contraintes des Invocations à choisir.
  summonFilter?: ScriptPokemonFilter;

  // damagePerOpponentDiscardCard / damagePerOwnDiscardCard : quelles cartes compter
  // (ex : { category: ['objet'] }) ; sans `cards` : toutes les cartes.
  cards?: ScriptCardFilter;

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

  // Code de l'attaque (voir types/script.ts), appliqué après les dégâts de l'attaque.
  script?: ScriptBlock[];
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
    | 'boostPokemonAttackThisTurn'
    | 'toolRetreatMinusOneIgnoreConditions'
    | 'healPokemonWithEnergyType'
    | 'healPokemon'
    | 'attachEnergy'
    | 'script';

  coinCount?: number;

  // Effet 'boostPokemonAttackThisTurn' (ex : Cynthia) :
  // pendant ce tour, l'attaque `boostAttackName` de vos Pokémon
  // dont le nom commence par `boostPokemonName` inflige `boostAmount`
  // dégâts supplémentaires.
  boostPokemonName?: string;
  boostAttackName?: string;
  boostAmount?: number;

  // Outil 'toolRetreatMinusOneIgnoreConditions' : réduction du coût de retraite (1 par défaut).
  retreatCostReduction?: number;

  // Effet 'healPokemonWithEnergyType' (ex : Flo) : soin de `healAmount` PV
  // sur l'un de vos Pokémon auquel une Énergie `healEnergyType` est attachée.
  healAmount?: number;
  healEnergyType?: EnergyType;

  // Cartes qui renvoient un Pokémon en main : mode de repose.
  // Par défaut : 'normal'.
  returnToHandReplacement?: ReturnToHandReplacement;

  // -----------------------------------------
  // EFFETS À RÉGLAGES ('healPokemon', 'attachEnergy')
  // -----------------------------------------
  // 'healPokemon' utilise `healAmount` (30 par défaut).
  // 'attachEnergy' : `energyAmount` Énergie(s) (1 par défaut) de type `energyType`
  // (par défaut : le type du Pokémon choisi). `endTurnAfter` : le tour se termine ensuite.
  energyType?: EnergyType;
  energyAmount?: number;
  endTurnAfter?: boolean;

  // Contraintes sur le Pokémon choisi (toutes facultatives, elles s'additionnent).
  // `coinCount` (plus haut) ajoute un lancer de pièce : l'effet s'applique sur FACE.
  target?: TrainerTargetFilter;

  // effect: 'script' : le code de la carte (voir types/script.ts).
  script?: ScriptBlock[];

  artwork?: any;
};

/** Contraintes sur le Pokémon ciblé par une carte Dresseur « à réglages ». */
export type TrainerTargetFilter = {
  // Type du Pokémon : ['plante'], ['feu', 'eau']…
  pokemonTypes?: EnergyType[];
  // Nom du Pokémon (début du nom) : ['Carchacrok'], ['Pikachu', 'Raichu']…
  pokemonNames?: string[];
  // Stade : ['base'], ['niveau1', 'niveau2']…
  stages?: Stage[];
  // Variante : ['gx', 'ex'], ['normal']…
  variants?: CardVariant[];
  // Doit avoir au moins une Énergie attachée.
  hasEnergy?: boolean;
  // Doit avoir au moins une Énergie de ce type attachée.
  hasEnergyType?: EnergyType;
  // Seulement le Pokémon actif, ou seulement un Pokémon de banc.
  position?: 'active' | 'bench';
};

export type GameCard = PokemonCard | TrainerCard;
