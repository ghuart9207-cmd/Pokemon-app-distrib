import { createEmptyBoard, createNormalPlayerStatus } from '@/features/game/rules';
import type { SummonChoices } from '@/features/game/rules';
import type {
  KnockoutRecord,
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
  PendingTrainerEffect,
  PendingScript,
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
  PendingDiscardTalentPlacement,
  PendingDamageCounterMove,
  PendingTalentHeal,
  PendingTalentToolReturn,
  PendingDiscardSummon,
  PendingOwnBenchDamage,
  PendingEnergyGather,
  PendingCountersToActive,
  PendingAttackSummonPlacement,
} from '@/features/game/types';

type UseGameRestartOptions = {
  setPlayer1Status: SetState<PlayerStatusState>;
  setPlayer2Status: SetState<PlayerStatusState>;
  setOpenedDiscardPlayer: SetState<Player | null>;
  setPendingDragonEnergyChoices:
  SetState<PendingDragonEnergyChoice[]>;
  setPendingDiscardTalentPlacement:
  SetState<PendingDiscardTalentPlacement | null>;
  setUsedDiscardTalentKeys: SetState<string[]>;
  setPendingInvocationPlacement: SetState<PendingInvocationPlacement | null>;
  setPendingAttackSummonPlacement: SetState<PendingAttackSummonPlacement | null>;
  setSelectedTrainerOwner: SetState<Player | null>;
  setPlayer1InvocationCards: SetState<PokemonCard[]>;
  setPlayer2InvocationCards: SetState<PokemonCard[]>;
  setInvocationSetupPlayer: SetState<Player | null>;
  setPendingAttackAfterCoin: SetState<CoinAttackReference | null>;
  setReadyCoinAttack: SetState<CoinAttackReference | null>;
  setPendingCoinReturnToHand: SetState<PendingCoinReturnToHand | null>;
  setPendingTrainerEffect: SetState<PendingTrainerEffect | null>;
  setPendingScript: SetState<PendingScript | null>;
  setTurnId: SetState<number>;
  setPendingKOSurvival: SetState<PendingKOSurvival | null>;
  setPendingGeneratedBenchEnergy: SetState<PendingGeneratedBenchEnergy | null>;
  setPendingOpponentActiveSwitch: SetState<PendingOpponentActiveSwitch | null>;
  setPendingKOEnergyMove: SetState<PendingKOEnergyMove | null>;
  setTrainerEffectActivated: SetState<boolean>;
  setPendingBothPlayersSwitch: SetState<PendingBothPlayersSwitch | null>;
  setPokemonPlacementLocks: SetState<Record<string, number>>;
  setFreeReplacementTokens: SetState<Record<string, number>>;
  setSelectedAttachedTool: SetState<{ card: TrainerCard; cellName: string } | null>;
  setPendingOpponentTarget: SetState<PendingOpponentTarget | null>;
  setPendingCoinFlip: SetState<PendingCoinFlip | null>;
  setPendingDamageCounterMove: SetState<PendingDamageCounterMove | null>;
  setPendingTalentHeal: SetState<PendingTalentHeal | null>;
  setPendingTalentToolReturn: SetState<PendingTalentToolReturn | null>;
  setPendingDiscardSummon: SetState<PendingDiscardSummon | null>;
  setPendingOwnBenchDamage: SetState<PendingOwnBenchDamage | null>;
  setPendingEnergyGather: SetState<PendingEnergyGather | null>;
  setPendingCountersToActive: SetState<PendingCountersToActive | null>;
  setPlayer1SummonChoices: SetState<SummonChoices>;
  setPlayer2SummonChoices: SetState<SummonChoices>;
  setInspectedPokemonCell: SetState<string | null>;
  setInspectedHandCard: SetState<{ card: PokemonCard; owner: Player } | null>;
  setVictoriousUsedTurnId: SetState<number | null>;
  setCoinDraft: SetState<(CoinSide | null)[]>;
  setPendingPokemonSwitch: SetState<PendingPokemonSwitch | null>;
  setPlayer1Discard: SetState<GameCard[]>;
  setKnockouts?: SetState<KnockoutRecord[]>;
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
  // En ligne : decks déjà envoyés.
  setSetupSubmitted?: SetState<Record<Player, boolean>>;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  setGameOver: SetState<boolean>;
  setForfeitedPlayer: SetState<Player | null>;
  setMessage: SetState<string>;
  player1SetupCards: GameCard[];
  player2SetupCards: GameCard[];

};

export function useGameRestart(options: UseGameRestartOptions) {
  function resetMatchState() {
    options.setPlayer1Status(createNormalPlayerStatus());
    options.setPlayer2Status(createNormalPlayerStatus());
    options.setOpenedDiscardPlayer(null);
    options.setPendingDiscardTalentPlacement(null);
    options.setUsedDiscardTalentKeys([]);
    options.setPendingInvocationPlacement(null);
    options.setPendingAttackSummonPlacement(null);
    options.setSelectedTrainerOwner(null);
    options.setInvocationSetupPlayer(null);
    options.setPendingAttackAfterCoin(null);
    options.setReadyCoinAttack(null);
    options.setPendingCoinReturnToHand(null);
    options.setPendingTrainerEffect(null);
    options.setPendingScript(null);
    options.setTurnId(1);
    options.setPendingKOSurvival(null);
    options.setPendingGeneratedBenchEnergy(null);
    options.setPendingOpponentActiveSwitch(null);
    options.setPendingKOEnergyMove(null);
    options.setTrainerEffectActivated(false);
    options.setPendingBothPlayersSwitch(null);
    options.setPokemonPlacementLocks({});
    options.setFreeReplacementTokens({});
    options.setSelectedAttachedTool(null);
    options.setPendingOpponentTarget(null);
    options.setPendingCoinFlip(null);
    options.setPendingDamageCounterMove(null);
    options.setPendingTalentHeal(null);
    options.setPendingTalentToolReturn(null);
    options.setInspectedPokemonCell(null);
    options.setInspectedHandCard(null);
    options.setPendingDiscardSummon(null);
    options.setPendingOwnBenchDamage(null);
    options.setPendingEnergyGather(null);
    options.setPendingCountersToActive(null);
    options.setVictoriousUsedTurnId(null);
    options.setCoinDraft([]);
    options.setPendingPokemonSwitch(null);
    options.setPlayer1Discard([]);
    options.setKnockouts?.([]);
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
    options.setForfeitedPlayer(null);
  }

  function restartGame() {
    resetMatchState();
    options.setPlayer1InvocationCards([]);
    options.setPlayer2InvocationCards([]);
    options.setPlayer1SummonChoices({});
    options.setPlayer2SummonChoices({});
    options.setPlayer1Hand([]);
    options.setPlayer2Hand([]);
    options.setPendingDragonEnergyChoices([]);
    options.setPlayer1SetupCards([]);
    options.setPlayer2SetupCards([]);
    options.setSetupPhase('player1');
    options.setSetupSubmitted?.({ 1: false, 2: false });
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
