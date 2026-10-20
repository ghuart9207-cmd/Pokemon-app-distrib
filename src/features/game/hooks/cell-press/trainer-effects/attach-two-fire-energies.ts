import type { BoardState } from '@/features/game/types';
import type { TrainerEffectContext } from './trainer-effect-context';
import { canAttachEnergyFromSource } from
  '@/features/game/rules';

/** Supporter : attache 2 Énergies Feu à un de ses Pokémon de type Feu, puis termine le tour. */
export function attachTwoFireEnergiesAndEndTurn(context: TrainerEffectContext): void {
  const {
    board,
    cellName,
    currentPlayer,
    endTurn,
    selectedTrainerCard,
    setMessage,
    setPlayer1Discard,
    setPlayer1Hand,
    setPlayer2Discard,
    setPlayer2Hand,
    target,
  } = context;
  if (!target) {
    setMessage('Choisis un de tes Pokémon de type Feu.');

    return;
  }

  if (target.owner !== currentPlayer) {
    setMessage('Tu dois choisir un de tes propres Pokémon.');

    return;
  }

  if (target.card.type !== 'feu') {
    setMessage(`${target.card.name} n'est pas un Pokémon de type Feu.`);

    return;
  }

// Vérifier si le Pokémon peut recevoir
// les énergies données par Kiawe.
if (!canAttachEnergyFromSource(target, 'hand')) {
  setMessage(
    `${target.card.name} ne peut pas recevoir d'Énergies depuis la main à cause d'une attaque adverse.`
  );

  return;
}

  const updatedBoard: BoardState = {
    ...board,

    [cellName]: {
      ...target,

      energies: [...target.energies, 'feu', 'feu'],
    },
  };

  // Supporter -> défausse
  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));

    setPlayer1Discard((discard) => [...discard, selectedTrainerCard]);
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));

    setPlayer2Discard((discard) => [...discard, selectedTrainerCard]);
  }

  // On termine immédiatement
  // le tour AVEC le nouveau plateau.
  endTurn(updatedBoard);
}
