import { useEffect, useRef, useState } from 'react';

import type { TutorialPanelInfo } from '@/features/game/components/panels/tutorial-panel';
import type { GameApi } from '@/features/game/hooks/use-game';
import type { CoinSide, GameCard, Player, TrainerCard } from '@/features/game/types';

import type { TutorialCheck, TutorialCourse, TutorialStep } from './tutorial-steps';

/** Temps entre deux gestes de l'adversaire (pour que le joueur voie ce qui se passe). */
const OPPONENT_DELAY_MS = 900;

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'\-\s]/g, '');
}

function sameName(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

/** Geste élémentaire de l'adversaire (un par rendu, comme le jeu en ligne). */
type OpponentOp =
  | { kind: 'hand'; name: string }
  | { kind: 'cell'; cell: string }
  | { kind: 'selectAttack'; cell: string; name: string }
  | { kind: 'attack' }
  | { kind: 'endTurn' };

function expandOpponentActions(step: TutorialStep): OpponentOp[] {
  return (step.opponent ?? []).flatMap((action): OpponentOp[] => {
    if ('place' in action) {
      return [
        { kind: 'hand', name: action.place },
        { kind: 'cell', cell: action.cell },
      ];
    }
    if ('attack' in action) {
      return [
        { kind: 'cell', cell: action.with },
        { kind: 'selectAttack', cell: action.with, name: action.attack },
        { kind: 'attack' },
        // puis les cases choisies après l'attaque
        ...[...(action.target ? [action.target] : []), ...(action.targets ?? [])].map(
          (cell): OpponentOp => ({ kind: 'cell', cell })
        ),
      ];
    }
    return [{ kind: 'endTurn' }];
  });
}

/**
 * Didacticiel : prépare la partie, bloque tout ce qui n'est pas demandé,
 * fait jouer l'adversaire et gère le bouton OK.
 */
export function useTutorial(rawGame: GameApi, course: TutorialCourse, onFinish: () => void) {
  const TUTORIAL_STEPS = course.steps;
  const [stepIndex, setStepIndex] = useState(0);
  const [hint, setHint] = useState('');
  const [undoCount, setUndoCount] = useState(0);
  const [undoCountAtStep, setUndoCountAtStep] = useState(0);
  const [opponentQueue, setOpponentQueue] = useState<OpponentOp[]>([]);
  const [opponentBusy, setOpponentBusy] = useState(false);

  // Toujours la version la plus récente du jeu (les fonctions changent à chaque rendu).
  const gameRef = useRef(rawGame);
  gameRef.current = rawGame;

  const step = TUTORIAL_STEPS[stepIndex];
  const allow = step?.allow ?? {};

  // ---------------------------------------------------------------
  // PRÉPARATION : decks imposés, pas de restriction, combat direct
  // ---------------------------------------------------------------
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const game = gameRef.current;
    const allCards: GameCard[] = [...game.cardSeries.pokemon, ...game.cardSeries.trainers];
    const findCards = (names: string[]) =>
      names
        .map((name) => allCards.find((card) => sameName(card.name, name)))
        .filter((card): card is GameCard => card !== undefined);

    const playerCards = findCards(course.playerDeck);
    const opponentCards = findCards(course.opponentDeck);

    // Invocations (Pokeball, Fan Club…) : « nom de la carte » → Pokémon invoqués
    const toSummonChoices = (summons: Record<string, string[]> | undefined) => {
      const choices: Record<string, GameCard[]> = {};
      Object.entries(summons ?? {}).forEach(([cardName, invoked]) => {
        const card = allCards.find((candidate) => sameName(candidate.name, cardName));
        if (card) choices[card.id.split('~')[0]] = findCards(invoked);
      });
      return choices;
    };
    game.setPlayer1SummonChoices(toSummonChoices(course.playerSummons));
    game.setPlayer2SummonChoices(toSummonChoices(course.opponentSummons));

    game.setNoPlacementRestrictions(true);
    game.setPlayer1SetupCards(playerCards);
    game.setPlayer2SetupCards(opponentCards);
    game.setPlayer1Hand(playerCards);
    game.setPlayer2Hand(opponentCards);
    // `opponentStarts` : l'adversaire joue le 1er tour
    game.setCurrentPlayer(course.opponentStarts ? 2 : 1);
    game.setRound(1);
    game.setSetupPhase('battle');
    game.setMessage('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------
  // ADVERSAIRE : ses gestes au début de chaque étape
  // ---------------------------------------------------------------
  useEffect(() => {
    const ops = step ? expandOpponentActions(step) : [];
    setUndoCountAtStep(undoCount);
    setHint('');
    if (ops.length > 0) {
      setOpponentQueue(ops);
      setOpponentBusy(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useEffect(() => {
    if (!opponentBusy) return;
    if (opponentQueue.length === 0) {
      setOpponentBusy(false);
      return;
    }

    const timer = setTimeout(() => {
      const game = gameRef.current;
      // On attend la fin d'un effet en cours (riposte d'un talent, etc.).
      // (sauf si c'est à l'adversaire de choisir une case pour cet effet)
      const scriptWaitsForOpponent =
        game.pendingScript &&
        (game.pendingScript.chooser ?? game.pendingScript.player) === 2 &&
        opponentQueue[0]?.kind === 'cell';
      if (game.pendingScript && !scriptWaitsForOpponent) {
        setOpponentQueue((queue) => [...queue]);
        return;
      }

      const [op, ...rest] = opponentQueue;
      runOpponentOp(game, op);
      setOpponentQueue(rest);
    }, OPPONENT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [opponentBusy, opponentQueue]);

  function runOpponentOp(game: GameApi, op: OpponentOp) {
    switch (op.kind) {
      case 'hand': {
        const card = game.player2Hand.find((handCard) => sameName(handCard.name, op.name));
        if (card) game.handleHandCardPress(card, 2);
        return;
      }
      case 'cell':
        game.handleCellPress(op.cell);
        return;
      case 'selectAttack': {
        const pokemon = game.board[op.cell];
        const index = pokemon?.card.attacks.findIndex((attack) => sameName(attack.name, op.name)) ?? -1;
        if (pokemon && index >= 0) {
          game.handleSelectAttack(index, `${pokemon.card.name} prépare ${pokemon.card.attacks[index].name}.`);
        }
        return;
      }
      case 'attack':
        game.tryAttackSelectedPokemon();
        return;
      case 'endTurn':
        game.handleEndTurn();
        return;
    }
  }

  // ---------------------------------------------------------------
  // CE QUI DOIT ÊTRE FAIT
  // ---------------------------------------------------------------
  function isCheckMet(check: TutorialCheck): boolean {
    const game = rawGame;

    if ('selectedHand' in check) {
      return !!game.selectedCard && sameName(game.selectedCard.name, check.selectedHand);
    }
    if ('pokemonAt' in check) {
      const pokemon = game.board[check.pokemonAt];
      return !!pokemon && pokemon.owner === 1 && sameName(pokemon.card.name, check.name);
    }
    if ('selected' in check) return game.selectedPokemonCell === check.selected;
    if ('attacked' in check) return game.board[check.attacked]?.hasAttacked === true;
    if ('turnOf' in check) return game.currentPlayer === check.turnOf;
    if ('energiesAtLeast' in check) {
      return (game.board[check.cell]?.energies.length ?? 0) >= check.energiesAtLeast;
    }
    if ('talentUsed' in check) return game.board[check.talentUsed]?.lastUsedTalentTurnId === game.turnId;
    if ('played' in check) return game.player1Discard.some((card) => sameName(card.name, check.played));
    if ('waitingForTarget' in check) return game.pendingScript?.stage === 'target';
    if ('undone' in check) return undoCount > undoCountAtStep;
    return false;
  }

  /** Un choix attend encore le joueur (on ne passe pas à la suite au milieu d'une action). */
  function isSomethingPending(): boolean {
    const game = rawGame;
    const waitingTarget = step?.done?.some((check) => 'waitingForTarget' in check);
    return (
      (!!game.pendingScript && !waitingTarget) ||
      !!game.pendingCoinFlip ||
      !!game.pendingGeneratedBenchEnergy ||
      !!game.pendingBenchEnergyAttachment ||
      !!game.pendingOpponentTarget
    );
  }

  const checks = step?.done ?? [];
  const stepDone = checks.every(isCheckMet) && !isSomethingPending();

  function handleOk() {
    if (opponentBusy) return;
    if (!stepDone) {
      setHint("Fais d'abord ce qui est demandé.");
      return;
    }
    if (stepIndex >= TUTORIAL_STEPS.length - 1) {
      onFinish();
      return;
    }
    setStepIndex((index) => index + 1);
  }

  // ---------------------------------------------------------------
  // CE QUE LE JOUEUR A LE DROIT DE FAIRE
  // ---------------------------------------------------------------
  function block(): void {
    setHint(opponentBusy ? "Attends que l'adversaire ait fini de jouer." : `Suis l'instruction : ${step?.text ?? ''}`);
  }

  /** Fin du tour : seulement quand le reste de l'étape est fait. */
  function otherChecksDone(): boolean {
    return checks.filter((check) => !('turnOf' in check)).every(isCheckMet);
  }

  const busy = () => opponentBusy || rawGame.currentPlayer !== 1;

  const game: GameApi = {
    ...rawGame,

    handleHandCardPress: (card: GameCard, owner: Player) => {
      if (busy() || owner !== 1 || !(allow.hand ?? []).some((name) => sameName(name, card.name))) return block();
      setHint('');
      rawGame.handleHandCardPress(card, owner);
    },
    handleCellPress: (cellName: string) => {
      if (opponentBusy || !(allow.cells ?? []).includes(cellName)) return block();
      setHint('');
      rawGame.handleCellPress(cellName);
    },
    handleSelectAttack: (index: number, message: string) => {
      if (busy() || !allow.attack) return block();
      rawGame.handleSelectAttack(index, message);
    },
    tryAttackSelectedPokemon: () => {
      if (busy() || !allow.attack) return block();
      rawGame.tryAttackSelectedPokemon();
    },
    handleEndTurn: () => {
      if (busy() || !allow.endTurn) return block();
      if (!otherChecksDone()) {
        setHint("Avant de finir ton tour, fais d'abord ce qui est demandé.");
        return;
      }
      rawGame.handleEndTurn();
    },
    activateSelectedTrainerCard: () => {
      if (busy() || !allow.trainer) return block();
      rawGame.activateSelectedTrainerCard();
    },
    startTrainerCoinFlip: (card: TrainerCard, player: Player, count: number) => {
      if (busy() || !allow.trainer) return block();
      rawGame.startTrainerCoinFlip(card, player, count);
    },
    chooseCoinSide: (index: number, side: CoinSide) => {
      if (opponentBusy || !allow.coin) return block();
      if (allow.coin !== true && side !== allow.coin) {
        setHint(`Choisis ${allow.coin === 'face' ? 'Face' : 'Pile'}.`);
        return;
      }
      rawGame.chooseCoinSide(index, side);
    },
    validatePendingCoinFlip: () => {
      if (opponentBusy || !allow.coin) return block();
      // nombre exact de côtés Face demandé par l'étape
      if (allow.coinFaces !== undefined && rawGame.pendingCoinFlip?.resolution.choiceAllowed) {
        const faces = rawGame.coinDraft.filter((side) => side === 'face').length;
        if (faces !== allow.coinFaces) {
          setHint(`Choisis exactement ${allow.coinFaces} côté${allow.coinFaces > 1 ? 's' : ''} Face.`);
          return;
        }
      }
      rawGame.validatePendingCoinFlip();
    },
    handleActivateTalent: () => {
      if (busy() || !allow.talent) return block();
      rawGame.handleActivateTalent();
    },
    undoTurn: () => {
      if (busy() || !allow.undo) return block();
      rawGame.undoTurn();
      setUndoCount((count) => count + 1);
    },
    retreatSelectedPokemon: () => {
      if (busy() || !allow.retreat) return block();
      setHint('');
      rawGame.retreatSelectedPokemon();
    },
    handlePlayerTargetPress: (player: Player) => {
      if (opponentBusy || !allow.player) return block();
      rawGame.handlePlayerTargetPress(player);
    },

    // Jamais pendant le didacticiel
    handleToolPress: () => block(),
    forfeitGame: () => block(),
    restartGame: () => block(),
    restartSameCards: () => block(),
    activateInvocationSupporter: () => block(),
  };

  const panel: TutorialPanelInfo = {
    text: step?.text ?? '',
    canContinue: stepDone,
    opponentPlaying: opponentBusy,
    hint,
    step: stepIndex + 1,
    total: TUTORIAL_STEPS.length,
    onOk: handleOk,
  };

  return { game, panel };
}

