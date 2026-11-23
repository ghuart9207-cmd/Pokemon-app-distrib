import type { BoardState } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/** Carte qui fait échanger deux Pokémon à chaque joueur (adversaire puis soi-même). */
export function handleBothPlayersSwitch(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    hasHorizontalPartner,
    pendingBothPlayersSwitch,
    playerCanSwitchHorizontally,
    setBoard,
    setHasUsedSupporterThisTurn,
    setMessage,
    setPendingBothPlayersSwitch,
    setPlayer1Discard,
    setPlayer1Hand,
    setPlayer2Discard,
    setPlayer2Hand,
    setSelectedAttachedTool,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
    setSelectedTrainerCard,
    setTrainerEffectActivated,
    turnId,
  } = context;

  if (!pendingBothPlayersSwitch) return false;

  const { card, playedBy, choosingPlayer, controlledBy, firstCell } =
    pendingBothPlayersSwitch;

  const clickedPokemon = board[cellName];

  if (clickedPokemon?.isInvocation) {
    setMessage(
      `${clickedPokemon.card.name} est une Invocation et ne peut pas être ciblé par cette carte Dresseur.`
    );

    return true;
  }

  // Le joueur qui doit choisir
  // doit cliquer sur un de ses Pokémon
  if (!clickedPokemon || clickedPokemon.owner !== choosingPlayer) {
    setMessage(
      `Joueur ${controlledBy} : tu dois choisir un Pokémon appartenant au joueur ${choosingPlayer}.`
    );

    return true;
  }

  // =================================
  // PREMIER POKÉMON
  // =================================

  if (firstCell === null) {
    if (!hasHorizontalPartner(board, choosingPlayer, cellName)) {
      setMessage(
        `${clickedPokemon.card.name} n'a aucun Pokémon de la même ligne avec lequel échanger.`
      );

      return true;
    }

    setPendingBothPlayersSwitch({
      ...pendingBothPlayersSwitch,
      firstCell: cellName,
    });

    setMessage(
      `Joueur ${controlledBy} : choisis maintenant un autre Pokémon du joueur ${choosingPlayer} sur la ligne ${cellName[0]}.`
    );

    return true;
  }

  // =================================
  // DEUXIÈME POKÉMON
  // =================================

  if (cellName === firstCell) {
    setMessage('Choisis un autre Pokémon.');

    return true;
  }

  if (cellName[0] !== firstCell[0]) {
    setMessage('Les deux Pokémon doivent être sur la même ligne.');

    return true;
  }

  const firstPokemon = board[firstCell];

  if (
    !firstPokemon ||
    firstPokemon.owner !== choosingPlayer ||
    firstPokemon.isInvocation
  ) {
    setPendingBothPlayersSwitch(null);

    setTrainerEffectActivated(false);

    return true;
  }

  // =================================
  // EFFECTUER L'ÉCHANGE
  // =================================

  const newBoard: BoardState = {
    ...board,
  };

  newBoard[firstCell] = {
    ...clickedPokemon,

    lastSwitchedTurnId: turnId,
  };

  newBoard[cellName] = {
    ...firstPokemon,

    lastSwitchedTurnId: turnId,
  };

  setBoard(newBoard);

  // =================================
  // L'ADVERSAIRE VIENT D'ÉCHANGER
  // =================================

  if (choosingPlayer !== playedBy) {
    const playerCanSwitch = playerCanSwitchHorizontally(newBoard, playedBy);

    // Le joueur qui a joué la carte
    // peut lui aussi échanger
    if (playerCanSwitch) {
      setPendingBothPlayersSwitch({
        card,

        playedBy,

        // Maintenant on échange
        // les Pokémon du joueur
        // ayant joué la carte.
        choosingPlayer: playedBy,

        // Et c'est évidemment toujours
        // lui qui choisit.
        controlledBy: playedBy,

        firstCell: null,
      });

      setMessage(
        `Échange du joueur ${choosingPlayer} terminé. Joueur ${playedBy}, choisis maintenant ton premier Pokémon.`
      );

      return true;
    }

    // Le joueur actif ne peut pas
    // échanger : l'effet se termine
  }

  // =================================
  // FIN DE L'EFFET
  // =================================

  if (playedBy === 1) {
    setPlayer1Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));

    setPlayer1Discard((discard) => [...discard, card]);
  } else {
    setPlayer2Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));

    setPlayer2Discard((discard) => [...discard, card]);
  }

  if (card.category === 'supporter') {
    setHasUsedSupporterThisTurn(true);
  }

  setPendingBothPlayersSwitch(null);

  setSelectedTrainerCard(null);

  setTrainerEffectActivated(false);

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);
  setSelectedAttachedTool(null);

  setMessage(
    card.category === 'supporter'
      ? 'Les échanges sont terminés. Le Supporter va dans la défausse.'
      : 'Les échanges sont terminés. La carte Objet va dans la défausse.'
  );

  return true;
}
