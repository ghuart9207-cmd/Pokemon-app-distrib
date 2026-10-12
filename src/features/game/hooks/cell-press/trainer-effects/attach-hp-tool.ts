import type { TrainerTargetEffectContext } from './trainer-effect-context';

/** Outil (Haltère) : l'attache à un Pokémon de Niveau 1, dont les PV maximum augmentent de 40. */
export function attachHpTool(context: TrainerTargetEffectContext): void {
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
    setMessage('Choisis un Pokémon de Niveau 1.');
    return;
  }

  if (pokemon.owner !== currentPlayer) {
    setMessage('Tu dois choisir un de tes Pokémon.');
    return;
  }

  if (pokemon.card.stage !== 'niveau1') {
    setMessage('Cet Outil peut seulement être attaché à un Pokémon de Niveau 1.');
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

      currentHp: pokemon.currentHp + 40,
    },
  }));

  setMessage(
    `${selectedTrainerCard.name} est attachée à ${pokemon.card.name}. Ses PV maximum augmentent de 40.`
  );

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));
  }
  // Ensuite il faudra retirer la carte
  // de la main du joueur.

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
}
