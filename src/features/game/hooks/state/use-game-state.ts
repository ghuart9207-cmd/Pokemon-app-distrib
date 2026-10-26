import { useState } from 'react';

import { STARTING_HANDS } from '@/features/game/data';
import { createEmptyBoard, createNormalPlayerStatus } from '@/features/game/rules';
import type { SummonChoices } from '@/features/game/rules';
import type {
  AttackPath,
  BoardState,
  CoinAttackReference,
  CoinConstraintQueues,
  CoinHistory,
  CoinSide,
  EnergyType,
  GameCard,
  PendingEnergyTransferToBench,
  PendingBenchEnergyAttachment,
  PendingBothPlayersSwitch,
  PendingCoinFlip,
  PendingCoinReturnToHand,
  PendingGeneratedBenchEnergy,
  PendingTalentEnergyAttachment,
  PendingDamageCounterMove,
  PendingDiscardSummon,
  PendingOwnBenchDamage,
  PendingEnergyGather,
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
  SelectedAttachedTool,
  TrainerCard,
  PendingDragonEnergyChoice,
  PendingDiscardTalentPlacement,
  PendingAttackSummonPlacement,
} from '@/features/game/types';

/**
 * Tout l'état React de la partie, regroupé par thème.
 * Les hooks `use-game-*` en reçoivent les valeurs et les setters dont ils ont besoin.
 */
export function useGameState() {
  // --- déroulement de la partie -----------------------------
  const [board, setBoard] = useState<BoardState>(() => createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [round, setRound] = useState(1);
  const [turnId, setTurnId] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Tour du joueur 1 : sélectionne Pikachu.');

  // --- actions déjà effectuées pendant le tour --------------
  const [hasPlacedThisTurn, setHasPlacedThisTurn] = useState(false);
  const [hasUsedSupporterThisTurn, setHasUsedSupporterThisTurn] = useState(false);
  const [hasAttackedThisTurn, setHasAttackedThisTurn] = useState(false);
  const [trainerEffectActivated, setTrainerEffectActivated] = useState(false);
  const [remainingAttackPaths, setRemainingAttackPaths] = useState<AttackPath[]>([]);
  const [pokemonPlacementLocks, setPokemonPlacementLocks] = useState<
    Record<string, number>
  >({});

  // Pokémon renvoyés en main par Margie ou Super Rappel :
  // clé `${joueur}-${idCarte}` -> nombre de reposes gratuites disponibles.
  // Une repose gratuite ne compte pas comme la pose du tour,
  // mais le Pokémon arrive sans Énergie.
  const [freeReplacementTokens, setFreeReplacementTokens] = useState<
    Record<string, number>
  >({});

  // --- sélection du joueur ----------------------------------
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [selectedTrainerCard, setSelectedTrainerCard] = useState<TrainerCard | null>(
    null
  );
  const [selectedTrainerOwner, setSelectedTrainerOwner] = useState<Player | null>(null);
  const [selectedPokemonCell, setSelectedPokemonCell] = useState<string | null>(null);
  const [selectedAttackIndex, setSelectedAttackIndex] = useState<number | null>(null);
  const [selectedAttachedTool, setSelectedAttachedTool] =
    useState<SelectedAttachedTool | null>(null);
  const [openedDiscardPlayer, setOpenedDiscardPlayer] = useState<Player | null>(null);
  // Talent de récupération depuis la défausse.
  const [pendingDiscardTalentPlacement, setPendingDiscardTalentPlacement,] = 
    useState<PendingDiscardTalentPlacement | null>(null);

// Les identifiants des Talents déjà utilisés pendant cette partie.
  const [usedDiscardTalentKeys, setUsedDiscardTalentKeys] = useState<string[]>([]);

  // --- mains, défausses, dégâts et statuts des joueurs ------
  const [player1Hand, setPlayer1Hand] = useState<GameCard[]>(STARTING_HANDS[1]);
  const [player2Hand, setPlayer2Hand] = useState<GameCard[]>(STARTING_HANDS[2]);
  const [player1Discard, setPlayer1Discard] = useState<GameCard[]>([]);
  const [player2Discard, setPlayer2Discard] = useState<GameCard[]>([]);
  const [player1DiscardEnergies, setPlayer1DiscardEnergies] = useState<EnergyType[]>([]);
  const [player2DiscardEnergies, setPlayer2DiscardEnergies] = useState<EnergyType[]>([]);
  const [player1Damage, setPlayer1Damage] = useState(0);
  const [player2Damage, setPlayer2Damage] = useState(0);
  const [player1Status, setPlayer1Status] = useState<PlayerStatusState>(
    createNormalPlayerStatus()
  );
  const [player2Status, setPlayer2Status] = useState<PlayerStatusState>(
    createNormalPlayerStatus()
  );

  // --- pièces (pile ou face) --------------------------------
  const [pendingCoinFlip, setPendingCoinFlip] = useState<PendingCoinFlip | null>(null);
  // Tour (turnId) pendant lequel un Talent Victorieux a été utilisé :
  // un seul Talent Victorieux par tour.
  const [victoriousUsedTurnId, setVictoriousUsedTurnId] = useState<number | null>(null);
  const [coinDraft, setCoinDraft] = useState<(CoinSide | null)[]>([]);
  const [pendingAttackAfterCoin, setPendingAttackAfterCoin] =
    useState<CoinAttackReference | null>(null);
  const [readyCoinAttack, setReadyCoinAttack] = useState<CoinAttackReference | null>(
    null
  );
  const [player1CoinConstraints, setPlayer1CoinConstraints] =
    useState<CoinConstraintQueues>({});
  const [player2CoinConstraints, setPlayer2CoinConstraints] =
    useState<CoinConstraintQueues>({});
  const [trainerCoinHistories, setTrainerCoinHistories] = useState<
    Record<string, CoinHistory>
  >({});

  // --- choix en attente (le joueur doit répondre avant de continuer) ---
  const [pendingBenchEnergyAttachment, setPendingBenchEnergyAttachment] =
    useState<PendingBenchEnergyAttachment | null>(null);
  const [pendingBothPlayersSwitch, setPendingBothPlayersSwitch] =
    useState<PendingBothPlayersSwitch | null>(null);
  const [pendingCoinReturnToHand, setPendingCoinReturnToHand] =
    useState<PendingCoinReturnToHand | null>(null);
  const [pendingDragonEnergyChoices,setPendingDragonEnergyChoices,] = 
    useState<PendingDragonEnergyChoice[]>([]);
  const [pendingGeneratedBenchEnergy, setPendingGeneratedBenchEnergy] =
    useState<PendingGeneratedBenchEnergy | null>(null);
  const [pendingEnergyTransferToBench,setPendingEnergyTransferToBench,] = 
    useState<PendingEnergyTransferToBench | null>(null);
  const [pendingAttackSummonPlacement, setPendingAttackSummonPlacement] =
    useState<PendingAttackSummonPlacement | null>(null);
  const [pendingTalentEnergyAttachment, setPendingTalentEnergyAttachment] =
    useState<PendingTalentEnergyAttachment | null>(null);
  const [pendingDamageCounterMove, setPendingDamageCounterMove] =
    useState<PendingDamageCounterMove | null>(null);
  const [pendingDiscardSummon, setPendingDiscardSummon] =
    useState<PendingDiscardSummon | null>(null);
  const [pendingOwnBenchDamage, setPendingOwnBenchDamage] =
    useState<PendingOwnBenchDamage | null>(null);
  const [pendingEnergyGather, setPendingEnergyGather] =
    useState<PendingEnergyGather | null>(null);
  // Invocation choisie à la préparation pour chaque Pokémon qui invoque
  // (clé = id de la carte qui invoque, ex : 'plumeline-001').
  const [player1SummonChoices, setPlayer1SummonChoices] = useState<SummonChoices>({});
  const [player2SummonChoices, setPlayer2SummonChoices] = useState<SummonChoices>({});

  // Consultation (sans pouvoir l'utiliser) d'un Pokémon adverse sur le plateau
  // ou d'une carte Pokémon dans une main.
  const [inspectedPokemonCell, setInspectedPokemonCell] = useState<string | null>(null);
  const [inspectedHandCard, setInspectedHandCard] = useState<{
    card: PokemonCard;
    owner: Player;
  } | null>(null);

  const [pendingInvocationPlacement, setPendingInvocationPlacement] =
    useState<PendingInvocationPlacement | null>(null);
  const [pendingKOEnergyMove, setPendingKOEnergyMove] =
    useState<PendingKOEnergyMove | null>(null);
  const [pendingKOSurvival, setPendingKOSurvival] = useState<PendingKOSurvival | null>(
    null
  );
  const [pendingOpponentActiveSwitch, setPendingOpponentActiveSwitch] =
    useState<PendingOpponentActiveSwitch | null>(null);
  const [pendingOpponentTarget, setPendingOpponentTarget] =
    useState<PendingOpponentTarget | null>(null);
  const [pendingPokemonSwitch, setPendingPokemonSwitch] =
    useState<PendingPokemonSwitch | null>(null);
  const [pendingSleepResolution, setPendingSleepResolution] =
    useState<PendingSleepResolution | null>(null);

  return {
    board,
    setBoard,
    currentPlayer,
    setCurrentPlayer,
    round,
    setRound,
    turnId,
    setTurnId,
    gameOver,
    setGameOver,
    message,
    setMessage,
    hasPlacedThisTurn,
    setHasPlacedThisTurn,
    hasUsedSupporterThisTurn,
    setHasUsedSupporterThisTurn,
    hasAttackedThisTurn,
    setHasAttackedThisTurn,
    trainerEffectActivated,
    setTrainerEffectActivated,
    remainingAttackPaths,
    setRemainingAttackPaths,
    pokemonPlacementLocks,
    setPokemonPlacementLocks,
    freeReplacementTokens,
    setFreeReplacementTokens,
    selectedCard,
    setSelectedCard,
    selectedTrainerCard,
    setSelectedTrainerCard,
    selectedTrainerOwner,
    setSelectedTrainerOwner,
    selectedPokemonCell,
    setSelectedPokemonCell,
    selectedAttackIndex,
    setSelectedAttackIndex,
    selectedAttachedTool,
    setSelectedAttachedTool,
    openedDiscardPlayer,
    setOpenedDiscardPlayer,
    player1Hand,
    setPlayer1Hand,
    player2Hand,
    setPlayer2Hand,
    player1Discard,
    setPlayer1Discard,
    player2Discard,
    setPlayer2Discard,
    player1DiscardEnergies,
    setPlayer1DiscardEnergies,
    player2DiscardEnergies,
    setPlayer2DiscardEnergies,
    player1Damage,
    setPlayer1Damage,
    player2Damage,
    setPlayer2Damage,
    player1Status,
    setPlayer1Status,
    player2Status,
    setPlayer2Status,
    pendingCoinFlip,
    victoriousUsedTurnId,
    setVictoriousUsedTurnId,
    setPendingCoinFlip,
    coinDraft,
    setCoinDraft,
    pendingAttackAfterCoin,
    setPendingAttackAfterCoin,
    readyCoinAttack,
    setReadyCoinAttack,
    player1CoinConstraints,
    setPlayer1CoinConstraints,
    player2CoinConstraints,
    setPlayer2CoinConstraints,
    trainerCoinHistories,
    setTrainerCoinHistories,
    pendingBenchEnergyAttachment,
    setPendingBenchEnergyAttachment,
    pendingBothPlayersSwitch,
    setPendingBothPlayersSwitch,
    pendingCoinReturnToHand,
    setPendingCoinReturnToHand,
    pendingGeneratedBenchEnergy,
    setPendingGeneratedBenchEnergy,
    pendingEnergyTransferToBench,
    setPendingEnergyTransferToBench,
    pendingAttackSummonPlacement,
    setPendingAttackSummonPlacement,
    pendingTalentEnergyAttachment,
    setPendingTalentEnergyAttachment,
    pendingDamageCounterMove,
    setPendingDamageCounterMove,
    pendingDiscardSummon,
    setPendingDiscardSummon,
    pendingOwnBenchDamage,
    setPendingOwnBenchDamage,
    pendingEnergyGather,
    setPendingEnergyGather,
    pendingInvocationPlacement,
    setPendingInvocationPlacement,
    player1SummonChoices,
    setPlayer1SummonChoices,
    player2SummonChoices,
    setPlayer2SummonChoices,
    inspectedPokemonCell,
    setInspectedPokemonCell,
    inspectedHandCard,
    setInspectedHandCard,
    pendingKOEnergyMove,
    setPendingKOEnergyMove,
    pendingKOSurvival,
    setPendingKOSurvival,
    pendingOpponentActiveSwitch,
    setPendingOpponentActiveSwitch,
    pendingOpponentTarget,
    setPendingOpponentTarget,
    pendingPokemonSwitch,
    setPendingPokemonSwitch,
    pendingSleepResolution,
    setPendingSleepResolution,
    pendingDragonEnergyChoices,
    setPendingDragonEnergyChoices,
    pendingDiscardTalentPlacement,
    setPendingDiscardTalentPlacement,
    usedDiscardTalentKeys,
    setUsedDiscardTalentKeys,
  };
}

export type GameState = ReturnType<typeof useGameState>;
