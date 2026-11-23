import type { CellPressContext } from './cell-press-context';

/** Talent de Scarhino : l'adversaire échange son Pokémon actif avec un Pokémon de son banc. */
export function handleOpponentActiveSwitch(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    pendingOpponentActiveSwitch,
    setBoard,
    setMessage,
    setPendingOpponentActiveSwitch,
    turnId,
  } = context;

  if (!pendingOpponentActiveSwitch) return false;

  const benchPokemon = board[cellName];

  if (!benchPokemon) {
    setMessage('Choisis un Pokémon de banc.');

    return true;
  }

  if (benchPokemon.owner !== pendingOpponentActiveSwitch.player) {
    setMessage(
      `Le joueur ${pendingOpponentActiveSwitch.player} doit choisir l’un de ses propres Pokémon.`
    );

    return true;
  }

  if (cellName === pendingOpponentActiveSwitch.activeCell) {
    setMessage('Tu dois choisir un autre Pokémon.');

    return true;
  }

  const activeCell = pendingOpponentActiveSwitch.activeCell;

  const activePokemon = board[activeCell];

  if (!activePokemon) {
    setPendingOpponentActiveSwitch(null);

    return true;
  }

  setBoard((previousBoard) => ({
    ...previousBoard,

    [activeCell]: previousBoard[cellName]
      ? {
          ...previousBoard[cellName]!,

          lastSwitchedTurnId: turnId,
        }
      : null,

    [cellName]: previousBoard[activeCell]
      ? {
          ...previousBoard[activeCell]!,

          lastSwitchedTurnId: turnId,
        }
      : null,
  }));

  setMessage(
    `Le joueur ${pendingOpponentActiveSwitch.player} échange ${activePokemon.card.name} avec ${benchPokemon.card.name}.`
  );

  setPendingOpponentActiveSwitch(null);

  return true;
}
