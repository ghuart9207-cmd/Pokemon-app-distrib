import type { CellPressContext } from './cell-press-context';

/** Super Rappel (pile ou face) : choix du Pokémon à remettre dans la main. */
export function handleCoinReturnToHand(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    pendingCoinReturnToHand,
    round,
    setBoard,
    setMessage,
    setPendingCoinReturnToHand,
    setPlayer1Hand,
    setPlayer2Hand,
    setPokemonPlacementLocks,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
  } = context;

  if (!pendingCoinReturnToHand) return false;

  const target = board[cellName];

  if (!target) {
    setMessage('Choisis un de tes Pokémon.');

    return true;
  }

  if (target.isInvocation) {
    setMessage(
      `${target.card.name} est une Invocation et ne peut pas être ciblé par Super Rappel.`
    );

    return true;
  }

  if (target.owner !== pendingCoinReturnToHand.player) {
    setMessage('Tu dois choisir un de tes propres Pokémon.');

    return true;
  }

  // Même blocage de repose que Margie
  if (target.card.stage === 'niveau1') {
    setPokemonPlacementLocks((previous) => ({
      ...previous,

      [target.card.id]: round,
    }));
  }

  if (target.card.stage === 'niveau2') {
    setPokemonPlacementLocks((previous) => ({
      ...previous,

      [target.card.id]: round + 1,
    }));
  }

  // Pokémon + Outil -> main
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

  // IMPORTANT :
  // on ne met PAS les Énergies
  // dans la défausse.
  // Elles disparaissent simplement.

  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]: null,
  }));

  setMessage(
    `${target.card.name} retourne dans la main.` +
      (target.attachedTool
        ? ` ${target.attachedTool.name} retourne également dans la main.`
        : '') +
      (target.energies.length > 0
        ? ` Ses ${target.energies.length} Énergie(s) disparaissent.`
        : '')
  );

  setPendingCoinReturnToHand(null);

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return true;
}
