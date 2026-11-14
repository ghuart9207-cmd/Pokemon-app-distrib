import type {
  BoardState,
  EnergyType,
  GameCard,
  PendingBenchEnergyAttachment,
  PendingBothPlayersSwitch,
  PendingCoinReturnToHand,
  PendingGeneratedBenchEnergy,
  PendingTalentEnergyAttachment,
  PendingDamageCounterMove,
  PendingTalentHeal,
  PendingTalentToolReturn,
  PendingDiscardSummon,
  PendingOwnBenchDamage,
  PendingEnergyGather,
  PendingCountersToActive,
  PendingInvocationPlacement,
  PendingKOEnergyMove,
  PendingOpponentActiveSwitch,
  PendingOpponentTarget,
  PendingPokemonSwitch,
  Player,
  PokemonCard,
  PokemonInPlay,
  PlayerStatusState,
  SetState,
  TrainerCard,
  PendingDragonEnergyChoice,
  PendingEnergyTransferToBench,
  PendingDiscardTalentPlacement,
  PendingAttackSummonPlacement,
} from '@/features/game/types';

export type CellPressContext = {
  board: BoardState;
  currentPlayer: Player;
  gameOver: boolean;
  selectedCard: PokemonCard | null;
  selectedTrainerCard: TrainerCard | null;
  player1Discard: GameCard[];
  player2Discard: GameCard[];
  pendingDiscardTalentPlacement: PendingDiscardTalentPlacement | null;
  usedDiscardTalentKeys: string[];
  setPendingDiscardTalentPlacement:
  SetState<PendingDiscardTalentPlacement | null>;
  setUsedDiscardTalentKeys: SetState<string[]>;
  setOpenedDiscardPlayer: SetState<Player | null>;
  selectedAttachedTool: { card: TrainerCard; cellName: string } | null;
  pendingBenchEnergyAttachment: PendingBenchEnergyAttachment | null;
  pendingBothPlayersSwitch: PendingBothPlayersSwitch | null;
  pendingCoinReturnToHand: PendingCoinReturnToHand | null;
  pendingGeneratedBenchEnergy: PendingGeneratedBenchEnergy | null;
  pendingTalentEnergyAttachment: PendingTalentEnergyAttachment | null;
  pendingDamageCounterMove: PendingDamageCounterMove | null;
  pendingTalentHeal: PendingTalentHeal | null;
  pendingTalentToolReturn: PendingTalentToolReturn | null;
  pendingDiscardSummon: PendingDiscardSummon | null;
  pendingOwnBenchDamage: PendingOwnBenchDamage | null;
  pendingEnergyGather: PendingEnergyGather | null;
  pendingCountersToActive: PendingCountersToActive | null;
  setPendingCountersToActive: SetState<PendingCountersToActive | null>;
  setInspectedPokemonCell: SetState<string | null>;
  setInspectedHandCard: SetState<{ card: PokemonCard; owner: Player } | null>;
  setPendingEnergyGather: SetState<PendingEnergyGather | null>;
  setPendingOwnBenchDamage: SetState<PendingOwnBenchDamage | null>;
  setPendingDiscardSummon: SetState<PendingDiscardSummon | null>;
  setPendingDamageCounterMove: SetState<PendingDamageCounterMove | null>;
  setPendingTalentHeal: SetState<PendingTalentHeal | null>;
  setPendingTalentToolReturn: SetState<PendingTalentToolReturn | null>;
  pendingInvocationPlacement: PendingInvocationPlacement | null;
  pendingKOEnergyMove: PendingKOEnergyMove | null;
  pendingEnergyTransferToBench: PendingEnergyTransferToBench | null;
  pendingAttackSummonPlacement: PendingAttackSummonPlacement | null;
  setPendingAttackSummonPlacement: SetState<PendingAttackSummonPlacement | null>;
  setPendingEnergyTransferToBench: SetState<PendingEnergyTransferToBench | null>;
  pendingOpponentActiveSwitch: PendingOpponentActiveSwitch | null;
  pendingOpponentTarget: PendingOpponentTarget | null;
  pendingPokemonSwitch: PendingPokemonSwitch | null;
  pokemonPlacementLocks: Record<string, number>;
  freeReplacementTokens: Record<string, number>;
  hasAttackedThisTurn: boolean;
  hasPlacedThisTurn: boolean;
  hasUsedSupporterThisTurn: boolean;
  trainerEffectActivated: boolean;
  round: number;
  turnId: number;
  player1DiscardEnergies: EnergyType[];
  player2DiscardEnergies: EnergyType[];
  setBoard: SetState<BoardState>;
  setHasPlacedThisTurn: SetState<boolean>;
  setHasUsedSupporterThisTurn: SetState<boolean>;
  setMessage: SetState<string>;
  setPendingBenchEnergyAttachment: SetState<PendingBenchEnergyAttachment | null>;
  setPendingBothPlayersSwitch: SetState<PendingBothPlayersSwitch | null>;
  setPendingCoinReturnToHand: SetState<PendingCoinReturnToHand | null>;
  setPendingGeneratedBenchEnergy: SetState<PendingGeneratedBenchEnergy | null>;
  setPendingTalentEnergyAttachment: SetState<PendingTalentEnergyAttachment | null>;
  setPendingInvocationPlacement: SetState<PendingInvocationPlacement | null>;
  setPendingKOEnergyMove: SetState<PendingKOEnergyMove | null>;
  setPendingOpponentActiveSwitch: SetState<PendingOpponentActiveSwitch | null>;
  setPendingOpponentTarget: SetState<PendingOpponentTarget | null>;
  setPendingPokemonSwitch: SetState<PendingPokemonSwitch | null>;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  setPendingDragonEnergyChoices:
  SetState<PendingDragonEnergyChoice[]>;
  setPokemonPlacementLocks: SetState<Record<string, number>>;
  setPlayer1Status: SetState<PlayerStatusState>;
  setPlayer2Status: SetState<PlayerStatusState>;
  setFreeReplacementTokens: SetState<Record<string, number>>;
  setSelectedAttachedTool: SetState<{ card: TrainerCard; cellName: string } | null>;
  setSelectedAttackIndex: SetState<number | null>;
  setSelectedCard: SetState<PokemonCard | null>;
  setSelectedPokemonCell: SetState<string | null>;
  setSelectedTrainerCard: SetState<TrainerCard | null>;
  setTrainerEffectActivated: SetState<boolean>;
  endTurn: (board?: BoardState) => void;
  doesTalentPreventAllAttackEffects: (
    target: PokemonInPlay,
    attacker: PokemonInPlay
  ) => boolean;
  getPokemonLockKey: (player: Player, cardId: string) => string;
  hasHorizontalPartner: (board: BoardState, player: Player, cellName: string) => boolean;
  playerCanSwitchHorizontally: (board: BoardState, player: Player) => boolean;
  prepareKOEnergyMove: (pokemon: PokemonInPlay, board: BoardState) => boolean;
  startKOSurvivalTalent: (
    pokemon: PokemonInPlay,
    cellName: string,
    board: BoardState
  ) => boolean;
};
