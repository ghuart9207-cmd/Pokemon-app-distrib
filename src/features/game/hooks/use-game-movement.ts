import { createAttackPaths, isTalentNegated } from '@/features/game/rules';
import type {
  AttackPath,
  BoardState,
  Player,
  PokemonInPlay,
  SetState,
} from '@/features/game/types';

type UseGameMovementOptions = {
  board: BoardState;
  remainingAttackPaths: AttackPath[];
  setRemainingAttackPaths: SetState<AttackPath[]>;
};

export function useGameMovement({
  board,
  remainingAttackPaths,
  setRemainingAttackPaths,
}: UseGameMovementOptions) {
  function getBaseAttackBlocker(attackerCell: string): PokemonInPlay | null {
    const attacker = board[attackerCell];
    if (!attacker || attacker.card.stage !== 'base') {
      return null;
    }

    const attackerColumn = attackerCell.substring(1);
    for (const [talentCell, talentPokemon] of Object.entries(board)) {
      if (
        !talentPokemon ||
        talentPokemon.owner === attacker.owner ||
        talentPokemon.card.talent?.type !== 'passive' ||
        talentPokemon.card.talent.effect !== 'blockBaseAttacks' ||
        isTalentNegated(talentPokemon, board, talentCell)
      ) {
        continue;
      }

      if (talentCell.substring(1) === attackerColumn) {
        return talentPokemon;
      }
    }

    return null;
  }

  function hasHorizontalPartner(
    boardToCheck: BoardState,
    player: Player,
    cellName: string
  ): boolean {
    const pokemonToCheck = boardToCheck[cellName];
    if (
      !pokemonToCheck ||
      pokemonToCheck.owner !== player ||
      pokemonToCheck.isInvocation
    ) {
      return false;
    }

    const row = cellName[0];
    return Object.entries(boardToCheck).some(
      ([otherCell, pokemon]) =>
        otherCell !== cellName &&
        otherCell[0] === row &&
        pokemon !== null &&
        pokemon.owner === player &&
        !pokemon.isInvocation
    );
  }

  function playerCanSwitchHorizontally(
    boardToCheck: BoardState,
    player: Player
  ): boolean {
    return Object.entries(boardToCheck).some(
      ([cellName, pokemon]) =>
        pokemon !== null &&
        pokemon.owner === player &&
        !pokemon.isInvocation &&
        hasHorizontalPartner(boardToCheck, player, cellName)
    );
  }

  function canAttackInCurrentOrder(cellName: string): boolean {
    return (
      remainingAttackPaths.length === 0 ||
      remainingAttackPaths.some((path) => path.includes(cellName))
    );
  }

  function advanceAttackOrder(cellName: string, player: Player) {
    if (remainingAttackPaths.length === 0) {
      const paths = createAttackPaths(cellName, player);
      setRemainingAttackPaths(
        paths.map((path) => path.slice(path.indexOf(cellName) + 1))
      );
      return;
    }

    setRemainingAttackPaths(
      remainingAttackPaths
        .filter((path) => path.includes(cellName))
        .map((path) => path.slice(path.indexOf(cellName) + 1))
    );
  }

  return {
    advanceAttackOrder,
    canAttackInCurrentOrder,
    getBaseAttackBlocker,
    hasHorizontalPartner,
    playerCanSwitchHorizontally,
  };
}
