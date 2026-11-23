import { BOARD_CELLS } from '@/features/game/rules';
import type {
  BoardState,
  GameCard,
  PendingInvocationPlacement,
  Player,
  PokemonCard,
  SetState,
  TrainerCard,
} from '@/features/game/types';

type UseGameInvocationOptions = {
  board: BoardState;
  currentPlayer: Player;
  hasAttackedThisTurn: boolean;
  hasUsedSupporterThisTurn: boolean;
  player1InvocationCards: PokemonCard[];
  player2InvocationCards: PokemonCard[];
  selectedTrainerCard: TrainerCard | null;
  selectedTrainerOwner: Player | null;
  setHasUsedSupporterThisTurn: SetState<boolean>;
  setMessage: SetState<string>;
  setPendingInvocationPlacement: SetState<PendingInvocationPlacement | null>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  setSelectedAttackIndex: SetState<number | null>;
  setSelectedPokemonCell: SetState<string | null>;
  setSelectedTrainerCard: SetState<TrainerCard | null>;
  setSelectedTrainerOwner: SetState<Player | null>;
  setTrainerEffectActivated: SetState<boolean>;
};

export function useGameInvocation(options: UseGameInvocationOptions) {
  const {
    board,
    currentPlayer,
    hasAttackedThisTurn,
    hasUsedSupporterThisTurn,
    player1InvocationCards,
    player2InvocationCards,
    selectedTrainerCard,
    selectedTrainerOwner,
    setHasUsedSupporterThisTurn,
    setMessage,
    setPendingInvocationPlacement,
    setPlayer1Discard,
    setPlayer1Hand,
    setPlayer2Discard,
    setPlayer2Hand,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
    setSelectedTrainerCard,
    setSelectedTrainerOwner,
    setTrainerEffectActivated,
  } = options;

  function activateInvocationSupporter() {
    if (!selectedTrainerCard || selectedTrainerCard.effect !== 'summonTwoBase60') {
      return;
    }

    // L'adversaire peut regarder,
    // jamais activer.
    if (selectedTrainerOwner !== currentPlayer) {
      setMessage(
        'Tu peux consulter cette carte, mais seul son propriétaire peut l’activer.'
      );

      return;
    }

    if (hasAttackedThisTurn) {
      setMessage('Tu ne peux plus jouer de carte Dresseur après avoir attaqué.');

      return;
    }

    if (hasUsedSupporterThisTurn) {
      setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');

      return;
    }

    const invocationCards =
      currentPlayer === 1 ? player1InvocationCards : player2InvocationCards;

    if (invocationCards.length !== 2) {
      setMessage('Cette carte doit avoir exactement 2 Invocations associées.');

      return;
    }

    const allowedRow = currentPlayer === 1 ? 'B' : 'C';

    const emptyCells = BOARD_CELLS.filter(
      (cell) => cell.startsWith(allowedRow) && board[cell] === null
    );

    if (emptyCells.length < 2) {
      setMessage(
        `Il faut 2 cases libres sur la ligne ${allowedRow} pour utiliser Invocation Duo.`
      );

      return;
    }

    const supporter = selectedTrainerCard;

    // --------------------------------
    // SUPPORTER -> DÉFAUSSE
    // --------------------------------

    if (currentPlayer === 1) {
      setPlayer1Hand((hand) => hand.filter((card) => card.id !== supporter.id));

      setPlayer1Discard((discard) => [...discard, supporter]);
    } else {
      setPlayer2Hand((hand) => hand.filter((card) => card.id !== supporter.id));

      setPlayer2Discard((discard) => [...discard, supporter]);
    }

    setHasUsedSupporterThisTurn(true);

    setPendingInvocationPlacement({
      player: currentPlayer,

      cards: [...invocationCards],

      selectedIndex: null,

      supporter,
    });

    setSelectedTrainerCard(null);

    setSelectedTrainerOwner(null);

    setTrainerEffectActivated(false);

    setSelectedPokemonCell(null);

    setSelectedAttackIndex(null);

    setMessage('Invocation Duo activée ! Choisis la première Invocation à poser.');
  }

  return { activateInvocationSupporter };
}
