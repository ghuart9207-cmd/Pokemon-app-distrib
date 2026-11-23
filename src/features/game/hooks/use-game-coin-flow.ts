import { superRappel } from '@/features/game/data';
import {
  describeTrainerTarget,
  hasValidTrainerTarget,
  isGenericTrainerEffect,
} from '@/features/game/hooks/cell-press/trainer-effects/generic-trainer-effect';
import {
  addTrainerCoinConstraint,
  consumeCoinConstraint,
  getKOPenalty,
  isAllCoinSide,
  isPokemonCard,
  isPlayerScriptPrevented,
  isTalentNegated,
  resolveCoinFlip,
  saveCoinResult,
} from '@/features/game/rules';
import type {
  BoardState,
  CoinAttackReference,
  CoinConstraintQueues,
  CoinHistory,
  CoinSide,
  EnergyType,
  GameCard,
  PendingCoinFlip,
  PendingScript,
  PlayerStatusState,
  PendingCoinReturnToHand,
  PendingTrainerEffect,
  PendingKOSurvival,
  PendingSleepResolution,
  Player,
  SetState,
  TrainerCard,
} from '@/features/game/types';

type UseGameCoinFlowOptions = {
  board: BoardState;
  currentPlayer: Player;
  turnId: number;
  victoriousUsedTurnId: number | null;
  setVictoriousUsedTurnId: SetState<number | null>;
  hasAttackedThisTurn: boolean;
  pendingCoinFlip: PendingCoinFlip | null;
  coinDraft: (CoinSide | null)[];
  player1CoinConstraints: CoinConstraintQueues;
  player2CoinConstraints: CoinConstraintQueues;
  trainerCoinHistories: Record<string, CoinHistory>;
  player1Hand: GameCard[];
  player2Hand: GameCard[];
  pendingAttackAfterCoin: CoinAttackReference | null;
  pendingKOSurvival: PendingKOSurvival | null;
  pendingSleepResolution: PendingSleepResolution | null;
  player1Status: PlayerStatusState;
  player2Status: PlayerStatusState;
  hasUsedSupporterThisTurn: boolean;
  pendingScript: PendingScript | null;
  setPendingScript: SetState<PendingScript | null>;
  setMessage: SetState<string>;
  setPendingCoinFlip: SetState<PendingCoinFlip | null>;
  setCoinDraft: SetState<(CoinSide | null)[]>;
  setTrainerCoinHistories: SetState<Record<string, CoinHistory>>;
  setPlayer1CoinConstraints: SetState<CoinConstraintQueues>;
  setPlayer2CoinConstraints: SetState<CoinConstraintQueues>;
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  setHasUsedSupporterThisTurn: SetState<boolean>;
  setSelectedTrainerCard: SetState<TrainerCard | null>;
  setTrainerEffectActivated: SetState<boolean>;
  setPendingAttackAfterCoin: SetState<CoinAttackReference | null>;
  setReadyCoinAttack: SetState<CoinAttackReference | null>;
  setPendingCoinReturnToHand: SetState<PendingCoinReturnToHand | null>;
  setPendingTrainerEffect: SetState<PendingTrainerEffect | null>;
  setPendingKOSurvival: SetState<PendingKOSurvival | null>;
  setPendingSleepResolution: SetState<PendingSleepResolution | null>;
  setBoard: SetState<BoardState>;
};

export function useGameCoinFlow({
  board,
  pendingScript,
  setPendingScript,
  player1Status,
  player2Status,
  hasUsedSupporterThisTurn,
  currentPlayer,
  turnId,
  victoriousUsedTurnId,
  setVictoriousUsedTurnId,
  hasAttackedThisTurn,
  pendingCoinFlip,
  coinDraft,
  player1CoinConstraints,
  player2CoinConstraints,
  trainerCoinHistories,
  player1Hand,
  player2Hand,
  pendingAttackAfterCoin,
  pendingKOSurvival,
  pendingSleepResolution,
  setMessage,
  setPendingCoinFlip,
  setCoinDraft,
  setTrainerCoinHistories,
  setPlayer1CoinConstraints,
  setPlayer2CoinConstraints,
  setPlayer1Hand,
  setPlayer2Hand,
  setPlayer1Discard,
  setPlayer2Discard,
  setPlayer1DiscardEnergies,
  setPlayer2DiscardEnergies,
  setPlayer1Damage,
  setPlayer2Damage,
  setHasUsedSupporterThisTurn,
  setSelectedTrainerCard,
  setTrainerEffectActivated,
  setPendingAttackAfterCoin,
  setReadyCoinAttack,
  setPendingCoinReturnToHand,
  setPendingTrainerEffect,
  setPendingKOSurvival,
  setPendingSleepResolution,
  setBoard,
}: UseGameCoinFlowOptions) {
  function getTrainerHistoryKey(player: Player, trainerId: string): string {
    return `${player}-${trainerId}`;
  }

  function startTrainerCoinFlip(trainer: TrainerCard, player: Player, coinCount: number) {
    if (hasAttackedThisTurn) {
      setMessage('Tu ne peux plus jouer de carte Dresseur après avoir attaqué.');
      return;
    }

    // Code des cartes : Objets / Supporters interdits.
    if (
      isPlayerScriptPrevented(
        player === 1 ? player1Status : player2Status,
        board,
        player,
        trainer.category === 'objet' ? 'items' : 'supporters'
      )
    ) {
      setMessage(`Joueur ${player} : tu ne peux pas jouer cette carte pour le moment (effet en cours).`);
      return;
    }
    if (
      trainer.subtype === 'outil' &&
      isPlayerScriptPrevented(player === 1 ? player1Status : player2Status, board, player, 'tools')
    ) {
      setMessage(`Joueur ${player} : tu ne peux pas jouer de carte Outil pour le moment (effet en cours).`);
      return;
    }

    // Carte « à réglages » : on vérifie avant de lancer qu'elle peut servir.
    if (isGenericTrainerEffect(trainer)) {
      const status = player === 1 ? player1Status : player2Status;

      if (trainer.category === 'objet' && status.itemsBlockedThisTurn) {
        setMessage(`Joueur ${player} : tu ne peux pas jouer de carte Objet pendant ce tour.`);
        return;
      }
      if (trainer.category === 'supporter' && hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }
      if (!hasValidTrainerTarget(trainer, board, player)) {
        setMessage(`${trainer.name} : aucun de tes Pokémon ne peut recevoir l'effet (${describeTrainerTarget(trainer)}).`);
        return;
      }
    }

    const trainerHistoryKey = getTrainerHistoryKey(player, trainer.id);
    const history = trainerCoinHistories[trainerHistoryKey] ?? {};
    const constraints = player === 1 ? player1CoinConstraints : player2CoinConstraints;
    const resolution = resolveCoinFlip(history, coinCount, constraints);

    setPendingCoinFlip({
      sourceType: 'trainer',
      sourceKey: trainer.id,
      sourceName: trainer.name,
      player,
      coinCount,
      resolution,
    });
    setCoinDraft(
      resolution.choiceAllowed
        ? Array(coinCount).fill(null)
        : resolution.result
          ? [...resolution.result]
          : []
    );
  }

  function startPokemonCoinFlip(cellName: string, coinCount: number) {
    const pokemon = board[cellName];
    if (!pokemon) {
      return;
    }

    const constraints =
      pokemon.owner === 1 ? player1CoinConstraints : player2CoinConstraints;
    const resolution = resolveCoinFlip(pokemon.coinHistory, coinCount, constraints);

    setPendingCoinFlip({
      sourceType: 'pokemon',
      sourceKey: cellName,
      sourceName: pokemon.card.name,
      player: pokemon.owner,
      coinCount,
      resolution,
    });
    setCoinDraft(
      resolution.choiceAllowed
        ? Array(coinCount).fill(null)
        : resolution.result
          ? [...resolution.result]
          : []
    );
  }

  // =====================================
  // TALENT VICTORIEUX
  // =====================================
  // Une fois par tour, après un lancer de pièces IMPOSÉ pour une attaque,
  // le joueur peut « relancer » : les pièces sont inversées (PILE <-> FACE).
  // Un seul Talent Victorieux par tour, même avec plusieurs Pokémon qui l'ont.

  const victoriousPokemon = pendingCoinFlip
    ? Object.entries(board).find(
        ([cell, pokemon]) =>
          pokemon !== null &&
          !isTalentNegated(pokemon, board, cell) &&
          pokemon.owner === pendingCoinFlip.player &&
          pokemon.card.talent?.effect === 'invertImposedAttackCoinFlipOncePerTurn'
      )?.[1] ?? null
    : null;

  const canUseVictoriousTalent = Boolean(
    pendingCoinFlip &&
      victoriousPokemon &&
      // seulement quand le résultat est imposé (pas de choix)
      !pendingCoinFlip.resolution.choiceAllowed &&
      pendingCoinFlip.resolution.result &&
      // seulement pour un lancer d'attaque, pendant son propre tour
      pendingCoinFlip.sourceType === 'pokemon' &&
      pendingAttackAfterCoin?.cellName === pendingCoinFlip.sourceKey &&
      pendingCoinFlip.player === currentPlayer &&
      // une seule fois par lancer et par tour
      !pendingCoinFlip.victoriousUsed &&
      victoriousUsedTurnId !== turnId
  );

  const victoriousTalentName = victoriousPokemon?.card.talent?.name ?? 'Victorieux';

  function activateVictoriousTalent() {
    if (!canUseVictoriousTalent || !pendingCoinFlip?.resolution.result) {
      return;
    }

    const previousResult = pendingCoinFlip.resolution.result;
    const invertedResult: CoinSide[] = previousResult.map((side) =>
      side === 'face' ? 'pile' : 'face'
    );

    const toText = (result: CoinSide[]) =>
      result.map((side) => (side === 'face' ? 'FACE' : 'PILE')).join(' / ');

    setPendingCoinFlip({
      ...pendingCoinFlip,
      victoriousUsed: true,
      resolution: {
        ...pendingCoinFlip.resolution,
        result: invertedResult,
      },
    });
    setCoinDraft([...invertedResult]);
    setVictoriousUsedTurnId(turnId);

    setMessage(
      `✨ Talent ${victoriousTalentName} de ${victoriousPokemon?.card.name ?? 'ton Pokémon'} : nouveau lancer ! ${toText(previousResult)} → ${toText(invertedResult)}. Valide le lancer pour continuer.`
    );
  }

  function chooseCoinSide(index: number, side: CoinSide) {
    setCoinDraft((previous) => {
      const next = [...previous];
      next[index] = side;
      return next;
    });
  }

  function validatePendingCoinFlip() {
    if (!pendingCoinFlip) {
      return;
    }

    let finalResult: CoinSide[];

    if (pendingCoinFlip.resolution.choiceAllowed) {
      const incomplete = coinDraft.some((side) => side === null);

      if (incomplete) {
        setMessage('Choisis Face ou Pile pour chaque pièce.');
        return;
      }

      finalResult = coinDraft.map((side) => side as CoinSide);
    } else {
      if (!pendingCoinFlip.resolution.result) {
        return;
      }

      finalResult = [...pendingCoinFlip.resolution.result];
    }

    // ---------------------------------
    // PLUSIEURS PIÈCES : TOUT FACE
    // seulement après un TOUT PILE
    // ---------------------------------

    if (
      pendingCoinFlip.coinCount > 1 &&
      pendingCoinFlip.resolution.choiceAllowed &&
      isAllCoinSide(finalResult, 'face')
    ) {
      let previousResult: CoinSide[] | undefined;

      // Pokémon
      if (pendingCoinFlip.sourceType === 'pokemon') {
        const pokemon = board[pendingCoinFlip.sourceKey];

        previousResult = pokemon?.coinHistory[pendingCoinFlip.coinCount];
      }

      // Dresseur
      else {
        const trainerHistoryKey = getTrainerHistoryKey(
          pendingCoinFlip.player,
          pendingCoinFlip.sourceKey
        );

        previousResult =
          trainerCoinHistories[trainerHistoryKey]?.[pendingCoinFlip.coinCount];
      }

      if (!isAllCoinSide(previousResult, 'pile')) {
        setMessage(
          `Tu ne peux choisir tout FACE que si le dernier lancer de ${pendingCoinFlip.coinCount} pièces de cet acteur était entièrement PILE.`
        );

        return;
      }
    }

    // -----------------------------
    // ENREGISTRER L'HISTORIQUE
    // DU POKÉMON
    // -----------------------------

    if (pendingCoinFlip.sourceType === 'pokemon') {
      setBoard((previousBoard) => {
        const pokemon = previousBoard[pendingCoinFlip.sourceKey];

        if (!pokemon) {
          return previousBoard;
        }

        return {
          ...previousBoard,

          [pendingCoinFlip.sourceKey]: {
            ...pokemon,

            coinHistory: saveCoinResult(
              pokemon.coinHistory,
              pendingCoinFlip.coinCount,
              finalResult
            ),
          },
        };
      });
    } else {
      const trainerHistoryKey = getTrainerHistoryKey(
        pendingCoinFlip.player,
        pendingCoinFlip.sourceKey
      );

      setTrainerCoinHistories((previous) => {
        const history = previous[trainerHistoryKey] ?? {};

        return {
          ...previous,

          [trainerHistoryKey]: saveCoinResult(
            history,
            pendingCoinFlip.coinCount,
            finalResult
          ),
        };
      });
    }

    // -----------------------------
    // CONSOMMER LA CONTRAINTE
    // DRESSEUR SI NÉCESSAIRE
    // -----------------------------
    // --------------------------------
    // CONSOMMER UNE CONTRAINTE DRESSEUR
    // --------------------------------

    if (pendingCoinFlip.resolution.consumeTrainerConstraint) {
      if (pendingCoinFlip.player === 1) {
        setPlayer1CoinConstraints((previous) =>
          consumeCoinConstraint(previous, pendingCoinFlip.coinCount)
        );
      } else {
        setPlayer2CoinConstraints((previous) =>
          consumeCoinConstraint(previous, pendingCoinFlip.coinCount)
        );
      }
    }

    if (pendingCoinFlip.sourceType === 'trainer') {
      if (pendingCoinFlip.player === 1) {
        setPlayer1CoinConstraints((previous) =>
          addTrainerCoinConstraint(previous, pendingCoinFlip.coinCount, finalResult)
        );
      } else {
        setPlayer2CoinConstraints((previous) =>
          addTrainerCoinConstraint(previous, pendingCoinFlip.coinCount, finalResult)
        );
      }
    }

    if (pendingCoinFlip.sourceType === 'trainer') {
      const trainerId = pendingCoinFlip.sourceKey;

      if (pendingCoinFlip.player === 1) {
        const trainerCard = player1Hand.find(
          (card): card is TrainerCard => card.id === trainerId && !isPokemonCard(card)
        );

        if (trainerCard) {
          setPlayer1Hand((previous) => previous.filter((card) => card.id !== trainerId));

          setPlayer1Discard((previous) => [...previous, trainerCard]);

          if (trainerCard.category === 'supporter') {
            setHasUsedSupporterThisTurn(true);
          }
        }
      } else {
        const trainerCard = player2Hand.find(
          (card): card is TrainerCard => card.id === trainerId && !isPokemonCard(card)
        );

        if (trainerCard) {
          setPlayer2Hand((previous) => previous.filter((card) => card.id !== trainerId));

          setPlayer2Discard((previous) => [...previous, trainerCard]);

          if (trainerCard.category === 'supporter') {
            setHasUsedSupporterThisTurn(true);
          }
        }
      }

      setSelectedTrainerCard(null);
      setTrainerEffectActivated(false);
    }

    // =====================================
    // CODE DES CARTES : la pièce d'un script, qui reprend avec le résultat
    // =====================================

    if (
      pendingScript?.stage === 'coin' &&
      pendingScript.coinKey === pendingCoinFlip.sourceKey
    ) {
      setPendingScript({ ...pendingScript, stage: 'run', coinResult: finalResult });
      setPendingCoinFlip(null);
      setCoinDraft([]);
      setMessage(
        `🪙 ${finalResult.map((side) => (side === 'face' ? 'FACE' : 'PILE')).join(' / ')}`
      );
      return;
    }

    // =====================================
    // CARTE « À RÉGLAGES » AVEC PIÈCE : FACE = l'effet s'applique
    // =====================================

    if (pendingCoinFlip.sourceType === 'trainer') {
      const genericCard = [...player1Hand, ...player2Hand].find(
        (card): card is TrainerCard =>
          card.id === pendingCoinFlip.sourceKey && !isPokemonCard(card) && isGenericTrainerEffect(card)
      );

      if (genericCard) {
        if (finalResult.includes('face')) {
          setPendingTrainerEffect({ card: genericCard, player: pendingCoinFlip.player });
          setMessage(`🪙 FACE ! ${genericCard.name} : choisis ${describeTrainerTarget(genericCard)}.`);
        } else {
          setMessage(`🪙 PILE ! ${genericCard.name} n'a aucun effet.`);
        }

        setPendingCoinFlip(null);
        setCoinDraft([]);
        return;
      }
    }

    // =====================================
    // OBJET : RAPPEL CHANCEUX
    // =====================================

    if (
      pendingCoinFlip.sourceType === 'trainer' &&
      pendingCoinFlip.sourceKey === superRappel.id
    ) {
      const result = finalResult[0];

      if (result === 'face') {
        setPendingCoinReturnToHand({
          player: pendingCoinFlip.player,
          returnToHandReplacement: superRappel.returnToHandReplacement,
        });

        setMessage('🪙 FACE ! Choisis l’un de tes Pokémon à remettre dans ta main.');
      } else {
        setMessage('🪙 PILE ! Rappel n’a aucun effet.');
      }

      setPendingCoinFlip(null);
      setCoinDraft([]);

      return;
    }

    const resultText = finalResult
      .map((side) => (side === 'face' ? 'FACE' : 'PILE'))
      .join(' / ');

    if (
      pendingAttackAfterCoin?.isCoinCheck &&
      pendingAttackAfterCoin.cellName === pendingCoinFlip.sourceKey
    ) {
      // Lancer de vérification imposé par l'adversaire.
      const checkedCell = pendingCoinFlip.sourceKey;
      const checkedPokemon = board[checkedCell];
      const failsOn = checkedPokemon?.attackCoinCheck?.failsOn ?? 'pile';
      const failed = finalResult.includes(failsOn);

      setBoard((previousBoard) => {
        const current = previousBoard[checkedCell];
        if (!current) return previousBoard;

        return {
          ...previousBoard,
          [checkedCell]: {
            ...current,
            attackCoinCheckResultTurnId: turnId,
            attackCoinCheckFailed: failed,
          },
        };
      });

      setPendingAttackAfterCoin(null);
      setMessage(
        failed
          ? `🪙 ${pendingCoinFlip.sourceName} : ${resultText}. Raté : son attaque ne fera rien. Appuie sur Attaquer pour terminer.`
          : `🪙 ${pendingCoinFlip.sourceName} : ${resultText}. Réussi ! Appuie de nouveau sur Attaquer.`
      );
    } else if (
      pendingAttackAfterCoin &&
      pendingAttackAfterCoin.cellName === pendingCoinFlip.sourceKey
    ) {
      setReadyCoinAttack({
        ...pendingAttackAfterCoin,
        coinResult: [...finalResult],
      });

      setPendingAttackAfterCoin(null);

      setMessage(
        `🪙 ${pendingCoinFlip.sourceName} : ${resultText}. Lancer validé ! Appuie de nouveau sur Attaquer.`
      );
    } else {
      setMessage(`🪙 ${pendingCoinFlip.sourceName} : ${resultText}`);
    }

    // =====================================
    // TALENT SCARHINO : SURVIE AU K.O.
    // =====================================

    if (
      pendingKOSurvival &&
      pendingCoinFlip.sourceType === 'pokemon' &&
      pendingCoinFlip.sourceKey === pendingKOSurvival.cellName
    ) {
      const result = finalResult[0];

      const pokemon = board[pendingKOSurvival.cellName];

      if (!pokemon) {
        setPendingKOSurvival(null);

        setPendingCoinFlip(null);
        setCoinDraft([]);

        return;
      }

      // -----------------------------
      // FACE : SCARHINO SURVIT
      // -----------------------------

      if (result === 'face') {
        setBoard((previousBoard) => {
          const currentPokemon = previousBoard[pendingKOSurvival.cellName];

          if (!currentPokemon) {
            return previousBoard;
          }

          return {
            ...previousBoard,

            [pendingKOSurvival.cellName]: {
              ...currentPokemon,

              currentHp: 10,
            },
          };
        });

        setMessage(
          `🪙 FACE ! ${pokemon.card.name} évite le K.O. grâce à ${pokemon.card.talent?.name} et reste en jeu avec 10 PV.`
        );
      }

      // -----------------------------
      // PILE : K.O. NORMAL
      // -----------------------------
      else {
        const penalty = getKOPenalty(pokemon.card.stage, pokemon.card.variant);

        setBoard((previousBoard) => ({
          ...previousBoard,

          [pendingKOSurvival.cellName]: null,
        }));

        if (pokemon.owner === 1) {
          setPlayer1Damage((damage) => damage + penalty);

          setPlayer1DiscardEnergies((discard) => [...discard, ...pokemon.energies]);

          setPlayer1Discard((discard) => [
            ...discard,

            pokemon.card,

            ...(pokemon.attachedTool ? [pokemon.attachedTool] : []),
          ]);
        } else {
          setPlayer2Damage((damage) => damage + penalty);

          setPlayer2DiscardEnergies((discard) => [...discard, ...pokemon.energies]);

          setPlayer2Discard((discard) => [
            ...discard,

            pokemon.card,

            ...(pokemon.attachedTool ? [pokemon.attachedTool] : []),
          ]);
        }

        setMessage(`🪙 PILE ! ${pokemon.card.name} est mis K.O.`);
      }

      setPendingKOSurvival(null);

      setPendingCoinFlip(null);
      setCoinDraft([]);

      return;
    }

    if (
      pendingSleepResolution &&
      pendingCoinFlip.sourceType === 'pokemon' &&
      pendingSleepResolution.sourceCell === pendingCoinFlip.sourceKey
    ) {
      const sleepCoin = finalResult[0];

      setBoard((previousBoard) => {
        const target = previousBoard[pendingSleepResolution.targetCell];

        if (!target) {
          return previousBoard;
        }

        const sleepEndPlayer =
          sleepCoin === 'face' ? target.owner : pendingSleepResolution.sourcePlayer;

        return {
          ...previousBoard,

          [pendingSleepResolution.targetCell]: {
            ...target,

            asleep: true,

            sleepSourcePlayer: pendingSleepResolution.sourcePlayer,

            sleepEndPlayer,
          },
        };
      });

      setPendingSleepResolution(null);
    }

    setPendingCoinFlip(null);
    setCoinDraft([]);
  }

  return {
    canUseVictoriousTalent,
    victoriousTalentName,
    activateVictoriousTalent,
    chooseCoinSide,
    validatePendingCoinFlip,
    getTrainerHistoryKey,
    startPokemonCoinFlip,
    startTrainerCoinFlip,
  };
}
