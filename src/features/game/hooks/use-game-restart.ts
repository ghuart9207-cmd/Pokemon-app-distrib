import { createEmptyBoard, createNormalPlayerStatus } from '@/features/game/rules';
import type {
  AttackPath,
  BoardState,
  CoinAttackReference,
  CoinConstraintQueues,
  CoinHistory,
  CoinSide,
  EnergyType,
  GameCard,
  PendingBenchEnergyAttachment,
  PendingBothPlayersSwitch,
  PendingCoinFlip,
  PendingCoinReturnToHand,
  PendingDragonEnergyChoice,
  PendingGeneratedBenchEnergy,
  PendingInvocationPlacement,
  PendingKOEnergyMove,
  PendingKOSurvival,
  PendingOpponentActiveSwitch,
  PendingOpponentTarget,
  PendingPokemonSwitch,
  PendingSleepResolution,
  Player,
  PlayerStatusState,
  PokemonCard,
  SetState,
  SetupPhase,
  TrainerCard,
} from '@/features/game/types';

type UseGameRestartOptions = {
  setPlayer1Status: SetState<PlayerStatusState>;
  setPlayer2Status: SetState<PlayerStatusState>;
  setOpenedDiscardPlayer: SetState<Player | null>;
  setPendingDragonEnergyChoices:
  SetState<PendingDragonEnergyChoice[]>;
  setPendingInvocationPlacement: SetState<PendingInvocationPlacement | null>;
  setSelectedTrainerOwner: SetState<Player | null>;
  setPlayer1InvocationCards: SetState<PokemonCard[]>;
  setPlayer2InvocationCards: SetState<PokemonCard[]>;
  setInvocationSetupPlayer: SetState<Player | null>;
  setPendingAttackAfterCoin: SetState<CoinAttackReference | null>;
  setReadyCoinAttack: SetState<CoinAttackReference | null>;
  setPendingCoinReturnToHand: SetState<PendingCoinReturnToHand | null>;
  setTurnId: SetState<number>;
  setPendingKOSurvival: SetState<PendingKOSurvival | null>;
  setPendingGeneratedBenchEnergy: SetState<PendingGeneratedBenchEnergy | null>;
  setPendingOpponentActiveSwitch: SetState<PendingOpponentActiveSwitch | null>;
  setPendingKOEnergyMove: SetState<PendingKOEnergyMove | null>;
  setTrainerEffectActivated: SetState<boolean>;
  setPendingBothPlayersSwitch: SetState<PendingBothPlayersSwitch | null>;
  setPokemonPlacementLocks: SetState<Record<string, number>>;
  setSelectedAttachedTool: SetState<{ card: TrainerCard; cellName: string } | null>;
  setPendingOpponentTarget: SetState<PendingOpponentTarget | null>;
  setPendingCoinFlip: SetState<PendingCoinFlip | null>;
  setCoinDraft: SetState<(CoinSide | null)[]>;
  setPendingPokemonSwitch: SetState<PendingPokemonSwitch | null>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setBoard: SetState<BoardState>;
  setCurrentPlayer: SetState<Player>;
  setRound: SetState<number>;
  setSelectedCard: SetState<PokemonCard | null>;
  setSelectedPokemonCell: SetState<string | null>;
  setSelectedTrainerCard: SetState<TrainerCard | null>;
  setSelectedAttackIndex: SetState<number | null>;
  setPendingSleepResolution: SetState<PendingSleepResolution | null>;
  setHasPlacedThisTurn: SetState<boolean>;
  setHasUsedSupporterThisTurn: SetState<boolean>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
  setPlayer1CoinConstraints: SetState<CoinConstraintQueues>;
  setPlayer2CoinConstraints: SetState<CoinConstraintQueues>;
  setTrainerCoinHistories: SetState<Record<string, CoinHistory>>;
  setHasAttackedThisTurn: SetState<boolean>;
  setRemainingAttackPaths: SetState<AttackPath[]>;
  setPendingBenchEnergyAttachment: SetState<PendingBenchEnergyAttachment | null>;
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  setPlayer1SetupCards: SetState<GameCard[]>;
  setPlayer2SetupCards: SetState<GameCard[]>;
  setSetupPhase: SetState<SetupPhase>;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  setGameOver: SetState<boolean>;
  setMessage: SetState<string>;
  player1SetupCards: GameCard[];
  player2SetupCards: GameCard[];

};

export function useGameRestart(options: UseGameRestartOptions) {
  function resetMatchState() {
    options.setPlayer1Status(createNormalPlayerStatus());
    options.setPlayer2Status(createNormalPlayerStatus());
    options.setOpenedDiscardPlayer(null);
    options.setPendingInvocationPlacement(null);
    options.setSelectedTrainerOwner(null);
    options.setInvocationSetupPlayer(null);
    options.setPendingAttackAfterCoin(null);
    options.setReadyCoinAttack(null);
    options.setPendingCoinReturnToHand(null);
    options.setTurnId(1);
    options.setPendingKOSurvival(null);
    options.setPendingGeneratedBenchEnergy(null);
    options.setPendingOpponentActiveSwitch(null);
    options.setPendingKOEnergyMove(null);
    options.setTrainerEffectActivated(false);
    options.setPendingBothPlayersSwitch(null);
    options.setPokemonPlacementLocks({});
    options.setSelectedAttachedTool(null);
    options.setPendingOpponentTarget(null);
    options.setPendingCoinFlip(null);
    options.setCoinDraft([]);
    options.setPendingPokemonSwitch(null);
    options.setPlayer1Discard([]);
    options.setPlayer2Discard([]);
    options.setBoard(createEmptyBoard());
    options.setCurrentPlayer(1);
    options.setRound(1);
    options.setSelectedCard(null);
    options.setSelectedPokemonCell(null);
    options.setSelectedTrainerCard(null);
    options.setTrainerEffectActivated(false);
    options.setSelectedAttackIndex(null);
    options.setPendingSleepResolution(null);
    options.setHasPlacedThisTurn(false);
    options.setHasUsedSupporterThisTurn(false);
    options.setPlayer1DiscardEnergies([]);
    options.setPlayer2DiscardEnergies([]);
    options.setPlayer1CoinConstraints({});
    options.setPlayer2CoinConstraints({});
    options.setTrainerCoinHistories({});
    options.setHasAttackedThisTurn(false);
    options.setRemainingAttackPaths([]);
    options.setPendingBenchEnergyAttachment(null);
    options.setPlayer1Damage(0);
    options.setPlayer2Damage(0);
    options.setGameOver(false);
  }

  function restartGame() {
    resetMatchState();
    options.setPlayer1InvocationCards([]);
    options.setPlayer2InvocationCards([]);
    options.setPlayer1Hand([]);
    options.setPlayer2Hand([]);
    options.setPendingDragonEnergyChoices([]);
    options.setPlayer1SetupCards([]);
    options.setPlayer2SetupCards([]);
    options.setSetupPhase('player1');
    options.setMessage('Joueur 1 : choisis 8 Pokémon, 3 Objets et 2 Supporters.');
  }

  function restartSameCards() {
    resetMatchState();
    options.setPlayer1Hand([...options.player1SetupCards]);
    options.setPlayer2Hand([...options.player2SetupCards]);
    options.setSetupPhase('battle');
    options.setMessage('Nouvelle partie avec les mêmes cartes ! Tour du joueur 1.');
  }

  return { restartGame, restartSameCards };
}
