import type { PokemonCard, TrainerCard,  AttackEffect, } from './cards';
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
  energyType: EnergyType;
  amount: number;
};

export type PendingCoinFlip = {
  sourceType: 'pokemon' | 'trainer';
  sourceKey: string;
  sourceName: string;
  player: Player;
  coinCount: number;
  resolution: CoinFlipResolution;
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

  supporter: TrainerCard;
};

export type PendingPokemonSwitch = {
  player: Player;
  attackerCell: string;
};


export type PendingDragonEnergyChoice = {
  cellName: string;
  player: Player;
  remaining: number;
};

export type PendingEnergyTransferToBench = {
  player: Player;
  attackerCell: string;
};

export type PendingDiscardTalentPlacement = {
  player: Player;
  card: PokemonCard;
  discardIndex: number;
};