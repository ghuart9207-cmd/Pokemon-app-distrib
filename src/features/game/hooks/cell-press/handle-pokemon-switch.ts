import type { CellPressContext } from './cell-press-context';

/** Échange du Pokémon attaquant avec un de ses Pokémon de banc après une attaque. */
export function handlePokemonSwitch(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    pendingPokemonSwitch,
    setBoard,
    setMessage,
    setPendingPokemonSwitch,
    setSelectedPokemonCell,
    turnId,
  } = context;

  if (!pendingPokemonSwitch) return false;

  const targetPokemon = board[cellName];

  const attacker = board[pendingPokemonSwitch.attackerCell];

  if (!attacker) {
    setPendingPokemonSwitch(null);
    return true;
  }

  // Échange par Talent : le tour a changé, on annule.
  if (
    pendingPokemonSwitch.fromTalentTurnId !== undefined &&
    pendingPokemonSwitch.fromTalentTurnId !== turnId
  ) {
    setPendingPokemonSwitch(null);
    return false;
  }

  if (!targetPokemon) {
    if (pendingPokemonSwitch.fromTalentTurnId !== undefined) {
      setPendingPokemonSwitch(null);
      setMessage("Échange annulé. Tu pourras utiliser le Talent plus tard pendant ce tour.");
      return true;
    }

    setMessage('Choisis un de tes Pokémon de banc.');
    return true;
  }

  if (targetPokemon.owner !== pendingPokemonSwitch.player) {
    setMessage('Tu dois choisir un de tes Pokémon.');
    return true;
  }

  if (cellName === pendingPokemonSwitch.attackerCell) {
    setMessage('Choisis un autre Pokémon.');
    return true;
  }

  const attackerRow = pendingPokemonSwitch.attackerCell[0];

  const targetRow = cellName[0];

  if (attackerRow !== targetRow) {
    setMessage(
      'Les Pokémon peuvent seulement échanger horizontalement sur la même ligne.'
    );
    return true;
  }

  const attackerCell = pendingPokemonSwitch.attackerCell;

  setBoard((previousBoard) => {
    const newBoard = {
      ...previousBoard,
    };

    const currentAttacker = previousBoard[attackerCell];

    const currentTarget = previousBoard[cellName];

    if (!currentAttacker || !currentTarget) {
      return previousBoard;
    }

    newBoard[attackerCell] = {
      ...currentTarget,

      lastSwitchedTurnId: turnId,
    };

    newBoard[cellName] = {
      ...currentAttacker,

      lastSwitchedTurnId: turnId,

      // Talent « une fois par tour » : marqué comme utilisé.
      ...(pendingPokemonSwitch.fromTalentTurnId !== undefined
        ? { lastUsedTalentTurnId: turnId }
        : {}),
    };

    return newBoard;
  });

  setMessage(`${attacker.card.name} échange sa place avec ${targetPokemon.card.name}.`);

  setPendingPokemonSwitch(null);
  setSelectedPokemonCell(null);

  return true;
}
