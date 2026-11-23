import type { TrainerTargetEffectContext } from './trainer-effect-context';

/** Outil (Relais) : l'attache à un de ses Pokémon (un seul Outil par Pokémon). */
export function attachKOEnergyTool(context: TrainerTargetEffectContext): void {
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

  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]: {
      ...pokemon,

      attachedTool: selectedTrainerCard,
    },
  }));

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));
  }

  setMessage(`${selectedTrainerCard.name} est attaché à ${pokemon.card.name}.`);

  setSelectedTrainerCard(null);

  setTrainerEffectActivated(false);
}
