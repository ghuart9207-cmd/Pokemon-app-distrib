import type { PokemonCard, TrainerCard } from './cards';
import type { CoinHistory, CoinSide } from './coins';
import type {CardVariant,EnergyType,Player,Stage,} from './core';
import type { ScriptModifier } from './script';


export type PlayerAttackBonus = {
  pokemonName: string;
  attackName: string;
  amount: number;
  sourceName: string;
};

export type PlayerStatusState = {
  poisoned: boolean;
  poisonSourcePlayer: Player | null;

  burned: boolean;
  burnSourcePlayer: Player | null;
  burnTriggersRemaining: number;

  itemsBlockedThisTurn?: boolean;

  // Bonus d'attaque valable jusqu'à la fin du tour du joueur (ex : Cynthia).
  attackBonusesThisTurn?: PlayerAttackBonus[];

  extraDamageNextTurn?: number;

  extraDamageNextTurnSourcePlayer?: Player | null;

  extraDamageNextTurnReady?: boolean;

  // Code des cartes : effets qui durent sur le joueur (prevent items / supporters).
  scriptModifiers?: ScriptModifier[];
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

  // Contre-coup : si ce Pokémon subit les dégâts d'une attaque pendant
  // le tour de `retaliationEndPlayer`, l'attaquant reçoit `retaliationDamage`.
  retaliationDamage?: number;
  retaliationEndPlayer?: Player | null;

  // Évite tous les DÉGÂTS des attaques pendant le tour de `preventAttackDamageEndPlayer`
  // (les effets des attaques s'appliquent quand même).
  preventAttackDamage?: boolean;
  preventAttackDamageEndPlayer?: Player | null;

  // Retraite gratuite pendant le tour `freeRetreatTurnId`
  // (effet d'attaque « pendant votre prochain tour… »).
  freeRetreatTurnId?: number | null;

  // Ne peut pas être soigné jusqu'à la fin du tour de `healBlockedEndPlayer`.
  healBlockedEndPlayer?: Player | null;

  // Effet 'coinCheckBeforeTargetAttackNextTurn' : pendant le prochain tour de
  // `endPlayer`, si ce Pokémon attaque, il lance d'abord `coinCount` pièces
  // (avec SON compteur de pièces) ; un seul `failsOn` et l'attaque ne fait rien.
  attackCoinCheck?: { coinCount: number; failsOn: CoinSide; endPlayer: Player } | null;

  // Effet 'reduceTargetAttackDamageNextTurn' : les attaques de ce Pokémon infligent
  // `outgoingAttackReduction` dégâts de moins jusqu'à la fin du tour de `...EndPlayer`.
  outgoingAttackReduction?: number;
  outgoingAttackReductionEndPlayer?: Player | null;
  // Résultat du lancer de vérification pendant ce tour.
  attackCoinCheckResultTurnId?: number;
  attackCoinCheckFailed?: boolean;

  preventAllAttackDamageAndEffects?: boolean;
preventAllAttackDamageAndEffectsEndPlayer?: Player | null;


// Code des cartes : effets qui durent (attaques, talents à activer, Dresseurs).
scriptModifiers?: ScriptModifier[];
// Code des cartes : effets des talents passifs en jeu (recalculés tout seuls).
auraModifiers?: ScriptModifier[];

temporaryAttackDamageProtection?: {
  stage?: Stage;
  variant?: CardVariant;
  expiresAfterPlayerTurn: Player;
};

};

export type BoardState = Record<string, PokemonInPlay | null>;
