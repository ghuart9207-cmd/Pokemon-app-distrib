
import { getPokemonMaxHp } from '@/features/game/rules';
import type { TrainerTargetEffectContext } from './trainer-effect-context';

/** Supporter (Margie) : ramène un de ses Pokémon blessés du plateau dans sa main. */
export function returnPokemonToHand(context: TrainerTargetEffectContext): void {
  const {
    board,
    cellName,
    currentPlayer,
    getPokemonLockKey,
    hasUsedSupporterThisTurn,
    round,
    selectedTrainerCard,
    setBoard,
    setHasUsedSupporterThisTurn,
    setMessage,
    setPlayer1Discard,
    setPlayer1Hand,
    setPlayer2Discard,
    setPlayer2Hand,
    setPokemonPlacementLocks,
    setSelectedAttachedTool,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
    setSelectedTrainerCard,
    setTrainerEffectActivated,
  } = context;
  const target = board[cellName];

  if (!target) {
    setMessage('Choisis un de tes Pokémon sur le plateau.');
    return;
  }

  if (target.owner !== currentPlayer) {
    setMessage('Tu dois choisir un de tes Pokémon.');
    return;
  }

  const targetMaxHp = getPokemonMaxHp(target);

  if (target.currentHp >= targetMaxHp) {
    setMessage(
      `${target.card.name} n'a subi aucun dégât. Margie ne peut être utilisée que sur un Pokémon blessé.`
    );

    return;
  }

  // Supporter déjà utilisé ce tour
  if (hasUsedSupporterThisTurn) {
    setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
    return;
  }

  // -----------------------------
  // BLOCAGE DE REPOSE
  // -----------------------------

  const placementLockKey = getPokemonLockKey(target.owner, target.card.id);

  if (target.card.stage === 'niveau1') {
    setPokemonPlacementLocks((previous) => ({
      ...previous,

      // Bloqué jusqu'à la fin
      // de la manche actuelle
      [placementLockKey]: round,
    }));
  }

  if (target.card.stage === 'niveau2') {
    setPokemonPlacementLocks((previous) => ({
      ...previous,

      // Manche actuelle +
      // prochain tour du joueur
      [placementLockKey]: round + 1,
    }));
  }

  // -----------------------------
  // REMET LE POKÉMON EN MAIN
  // -----------------------------

  if (target.owner === 1) {
    setPlayer1Hand((hand) => [
      ...hand,
      target.card,

      ...(target.attachedTool ? [target.attachedTool] : []),
    ]);
  } else {
    setPlayer2Hand((hand) => [
      ...hand,
      target.card,

      ...(target.attachedTool ? [target.attachedTool] : []),
    ]);
  }

  // Libère la case
  setBoard((previousBoard) => ({
    ...previousBoard,
    [cellName]: null,
  }));

  // Le Supporter va dans
  // la défausse
  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));

    setPlayer1Discard((discard) => [...discard, selectedTrainerCard]);
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));

    setPlayer2Discard((discard) => [...discard, selectedTrainerCard]);
  }

  setHasUsedSupporterThisTurn(true);

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedAttachedTool(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `${target.card.name} retourne dans la main du joueur ${target.owner}.` +
      (target.attachedTool
        ? ` ${target.attachedTool.name} retourne également dans la main.`
        : '') +
      (target.card.stage === 'niveau1'
        ? ` ${target.card.name} ne peut pas être reposé pendant ce tour.`
        : target.card.stage === 'niveau2'
          ? ` ${target.card.name} ne peut être reposé ni pendant ce tour ni pendant le prochain tour de ce joueur.`
          : '')
  );
}
