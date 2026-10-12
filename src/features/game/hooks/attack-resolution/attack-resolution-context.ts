import type {
  Attack,
  BoardState,
  EnergyType,
  GameCard,
  PendingBenchEnergyAttachment,
  PendingGeneratedBenchEnergy,
  PendingOpponentActiveSwitch,
  PendingOpponentTarget,
  PendingPokemonSwitch,
  PendingSleepResolution,
  Player,
  PokemonInPlay,
  SetState,
} from '@/features/game/types';

export type AttackResolutionContext = {
  board: BoardState;
  currentPlayer: Player;
  player1Discard: GameCard[];
player2Discard: GameCard[];
  player1DiscardEnergies: EnergyType[];
  player2DiscardEnergies: EnergyType[];
  round: number;
  selectedAttackIndex: number | null;
  selectedPokemonCell: string | null;
  turnId: number;
  setBoard: SetState<BoardState>;
  setHasAttackedThisTurn: SetState<boolean>;
  setMessage: SetState<string>;
  setPendingBenchEnergyAttachment: SetState<PendingBenchEnergyAttachment | null>;
  setPendingGeneratedBenchEnergy: SetState<PendingGeneratedBenchEnergy | null>;
  setPendingOpponentActiveSwitch: SetState<PendingOpponentActiveSwitch | null>;
  setPendingOpponentTarget: SetState<PendingOpponentTarget | null>;
  setPendingPokemonSwitch: SetState<PendingPokemonSwitch | null>;
  setPendingSleepResolution: SetState<PendingSleepResolution | null>;
  setPlayer1Damage: SetState<number>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Damage: SetState<number>;
  setPlayer2Discard: SetState<GameCard[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  setPokemonPlacementLocks: SetState<Record<string, number>>;
  setSelectedAttackIndex: SetState<number | null>;
  setSelectedPokemonCell: SetState<string | null>;
  advanceAttackOrder: (cellName: string, player: Player) => void;
  canAttackInCurrentOrder: (cellName: string) => boolean;
  applyAttackStatusToPlayer: (
    player: Player,
    attack: Attack,
    sourcePlayer: Player
  ) => void;
  doesTalentPreventAllAttackEffects: (
    target: PokemonInPlay,
    attacker: PokemonInPlay
  ) => boolean;
  doesTalentPreventDamage: (target: PokemonInPlay, attacker: PokemonInPlay) => boolean;
  getPokemonLockKey: (player: Player, cardId: string) => string;
  handleAttackerKO: (
    board: BoardState,
    attacker: PokemonInPlay,
    cellName: string
  ) => boolean;
  prepareKOEnergyMove: (pokemon: PokemonInPlay, board: BoardState) => void;
  startBenchOrPlayerDamageTarget: (
    attacker: PokemonInPlay,
    attackerCell: string,
    attack: Attack,
    mainTargetCell: string | null
  ) => boolean;
  startKOSurvivalTalent: (
    pokemon: PokemonInPlay,
    cellName: string,
    board: BoardState
  ) => boolean;
  startPokemonCoinFlip: (cellName: string, coinCount: number) => void;
};
