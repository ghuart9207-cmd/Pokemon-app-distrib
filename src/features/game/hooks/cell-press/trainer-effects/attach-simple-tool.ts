import type { TrainerTargetEffectContext } from './trainer-effect-context';

/** Outil sans condition de pose : s'attache à n'importe lequel de vos Pokémon sans Outil. */
export function attachSimpleTool(context: TrainerTargetEffectContext): void {
  const {
    board,
    cellName,
    currentPlayer,
    selectedTrainerCard,
    setBoard,
    setMessage,
    setPlayer1Hand,
    setPlayer2Hand,
    setSelectedTrainerCard,
    setTrainerEffectActivated,
  } = context;
  const pokemon = board[cellName];

  if (!pokemon) {
    setMessage('Choisis un de tes Pokémon.');
    return;
  }

  if (pokemon.owner !== currentPlayer) {
    setMessage('Tu dois choisir un de tes Pokémon.');
    return;
  }

  if (pokemon.attachedTool) {
    setMessage(`${pokemon.card.name} possède déjà un Outil.`);
    return;
  }

  setBoard((previousBoard) => {
    const current = previousBoard[cellName];
    return current
      ? { ...previousBoard, [cellName]: { ...current, attachedTool: selectedTrainerCard } }
      : previousBoard;
  });

  setMessage(`${selectedTrainerCard.name} est attachée à ${pokemon.card.name}.`);

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));
  }

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
}
