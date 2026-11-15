import type { PokemonCard, TrainerCard,  AttackEffect, ReturnToHandReplacement } from './cards';
import type { CoinFlipResolution } from './coins';
import type { EnergyType, Player } from './core';

export type PendingKOSurvival = {
  cellName: string;
  
  player: Player;
};


export type PendingGeneratedBenchEnergy = {
  player: Player;
  attackerCell: string;
  energyType: EnergyType;
  amount: number;

  // Si true, on déplace les énergies
  // de l'attaquant vers le Pokémon de banc.
  moveFromAttacker?: boolean;

  // Seul un Pokémon de ce type peut recevoir l'Énergie.
  targetPokemonType?: EnergyType;

  // Énergies à répartir une par une (un clic = 1 Énergie), ex : une par FACE.
  oneByOne?: boolean;
};

export type PendingTalentEnergyAttachment = {
  player: Player;
  sourceCell: string;
  energyType: EnergyType;
  amount: number;
  targetPokemonType?: EnergyType;
  turnId: number;
};

export type PendingOpponentTargetMode =
  'anyOpponentPokemon' | 'damagedOpponentOrPlayer' | 'benchOrPlayer';

export type PendingCoinReturnToHand = {
  player: Player;

  // Mode de repose défini par la carte (Super Rappel : 'free').
  returnToHandReplacement?: ReturnToHandReplacement;
};

export type PendingOpponentActiveSwitch = {
  player: Player;

  activeCell: string;
};

export type PendingKOEnergyMove = {
  player: Player;

  sourcePokemonName: string;

  availableEnergies: EnergyType[];

  selectedEnergy: EnergyType | null;

  // Nombre d'Énergies qu'il reste à déplacer
  // (Relais Optimiste : 2 au départ).
  remaining: number;

  // Nombre total d'Énergies à déplacer, pour l'affichage.
  total: number;

  // Pokémon qui reçoit les Énergies : fixé après la 1ʳᵉ,
  // car toutes les Énergies vont sur le même Pokémon.
  targetCell?: string | null;
};

export type PendingOpponentTarget = {
  player: Player;

  attackerCell: string;

  damage: number;

  mode: PendingOpponentTargetMode;

  excludedCell?: string | null;
  excludedPlayer?: Player | null;

  
effects?: AttackEffect[];

};

export type PendingBothPlayersSwitch = {
  card: TrainerCard;

  // Joueur qui a joué la carte
  playedBy: Player;

  // Propriétaire des Pokémon
  // actuellement à échanger
  choosingPlayer: Player;

  // Joueur qui décide réellement
  // quels Pokémon sont choisis
  controlledBy: Player;

  firstCell: string | null;
};

export type PendingBenchEnergyAttachment = {
  player: Player;
  attackerCell: string;
  // Absent : n'importe quelle Énergie de la défausse (la dernière défaussée).
  energyType?: EnergyType;
  // Seul un Pokémon de ce type peut recevoir l'Énergie.
  targetPokemonType?: EnergyType;
  amount: number;
};

export type PendingCoinFlip = {
  sourceType: 'pokemon' | 'trainer';
  sourceKey: string;
  sourceName: string;
  player: Player;
  coinCount: number;
  resolution: CoinFlipResolution;

  // Vrai si le Talent Victorieux a déjà été utilisé sur ce lancer.
  victoriousUsed?: boolean;
};

export type PendingSleepResolution = {
  sourceCell: string;
  targetCell: string;
  sourcePlayer: Player;
};

export type PendingInvocationPlacement = {
  player: Player;

  cards: PokemonCard[];

  selectedIndex: number | null;

  // Fan Club Pokémon (Supporter) ou attaque à réserve d'Invocations.
  supporter?: TrainerCard;
  source?: 'supporter' | 'attack';

  // Attaque : nombre d'Invocations qu'il reste à poser (les autres restent en réserve).
  remainingToPlace?: number;

  // Titre du panneau (ex : nom de l'attaque).
  title?: string;
};

export type PendingPokemonSwitch = {
  player: Player;
  attackerCell: string;

  // Échange lancé par un Talent (« une seule fois pendant votre tour ») :
  // clic sur une case vide = annuler, et le Talent est marqué utilisé après l'échange.
  fromTalentTurnId?: number;
};


export type PendingDragonEnergyChoice = {
  cellName: string;
  player: Player;
  remaining: number;
};

export type PendingEnergyTransferToBench = {
  player: Player;
  attackerCell: string;
  // Seul un Pokémon de ce type peut recevoir les Énergies.
  targetPokemonType?: EnergyType;
};

/** Invocation créée par une attaque (ex : Division de Tadmorv d'Alola). */
export type PendingAttackSummonPlacement = {
  player: Player;

  // Carte à invoquer.
  card: PokemonCard;

  // Nombre d'Invocations restant à poser.
  remaining: number;

  // Pour les messages.
  attackerName: string;
  attackName: string;
};

/** Talent « placez un Outil attaché à l'un de vos Pokémon dans votre main » en cours. */
export type PendingTalentToolReturn = {
  player: Player;
  // Case du Pokémon qui possède le Talent.
  sourceCell: string;
  turnId: number;
};

/** Talent « soignez X dégâts à l'un de vos Pokémon » en cours. */
export type PendingTalentHeal = {
  player: Player;
  // Case du Pokémon qui possède le Talent.
  sourceCell: string;
  amount: number;
  turnId: number;
};

/** Talent « déplacer un marqueur de dégâts » (Lugulabre) en cours. */
export type PendingDamageCounterMove = {
  player: Player;
  // Case du Pokémon qui possède le Talent.
  sourceCell: string;
  // Case du Pokémon qui donne le marqueur (null tant qu'il n'est pas choisi).
  fromCell: string | null;
  // Dégâts déplacés (1 marqueur = 10).
  amount: number;
  // Si vrai, le marqueur doit venir de l'un des Pokémon du joueur.
  fromOwnPokemonOnly: boolean;
  turnId: number;
};

/** Invocation d'un Pokémon depuis une défausse (la sienne ou celle de l'adversaire). */
export type PendingDiscardSummon = {
  // Joueur qui a attaqué (c'est lui qui choisit).
  player: Player;
  attackName: string;
  // Règle de l'effet (type, PV maximum).
  pokemonType?: EnergyType;
  maxHp?: number;
  // Pokémon choisi dans une défausse (null tant qu'il n'est pas choisi).
  selected: { fromPlayer: Player; discardIndex: number; cardId: string } | null;
  turnId: number;
};

/** Effet « infligez X dégâts à l'un de vos Pokémon de banc » en attente du choix. */
export type PendingOwnBenchDamage = {
  player: Player;
  attackerCell: string;
  amount: number;
  attackName: string;
  turnId: number;
};

/** Talent à la pose : rassembler des Énergies sur ce Pokémon, puis l'échanger. */
export type PendingEnergyGather = {
  player: Player;
  // Case du Pokémon qui vient d'être posé (il reçoit les Énergies).
  targetCell: string;
  // Type des Énergies à déplacer (absent : n'importe quel type).
  energyType?: EnergyType;
  moved: number;
  // Nom affiché (Talent ou attaque).
  talentName: string;
  turnId: number;
  // Effet d'attaque 'gatherEnergyFromBench' : pas d'échange à la fin.
  fromAttack?: boolean;
  // Pokémon cliqué qui a plusieurs types d'Énergies : choix en attente.
  sourceCell?: string | null;
  choiceTypes?: EnergyType[];
};

/** Déplacer des marqueurs de ses Pokémon vers le Pokémon actif adverse. */
export type PendingCountersToActive = {
  player: Player;
  // Case du Pokémon actif adverse (null = pas de Pokémon en face : le joueur adverse).
  targetCell: string | null;
  // Dégâts déplacés par Pokémon choisi (4 marqueurs = 40).
  perPokemon: number;
  remainingPicks: number;
  usedCells: string[];
  attackName: string;
  turnId: number;
};

export type PendingDiscardTalentPlacement = {
  player: Player;
  card: PokemonCard;
  discardIndex: number;
};