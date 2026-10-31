import { addFreeReplacementToken, getPokemonMaxHp, isHealBlocked } from '@/features/game/rules';
import type {
  BoardState,
  PokemonInPlay,
  ReturnToHandReplacement,
} from '@/features/game/types';
import { getFreeReplacementMessage } from '../cell-press/trainer-effects/free-replacement-message';
import type { AttackResolutionContext } from './attack-resolution-context';

/**
 * Attaque qui renvoie l'attaquant dans la main (effet 'returnSelfToHand'),
 * en soignant d'abord tous les Pokémon du joueur si `healAll` (effet 'healAllOwnPokemon').
 */
export function healAllAndReturnToHand(
  context: AttackResolutionContext,
  locals: {
    attacker: PokemonInPlay;
    selectedPokemonCell: string;
    healAll: boolean;
    attackName: string;
    returnToHandReplacement?: ReturnToHandReplacement;
  }
): void {
  const {
    board,
    getPokemonLockKey,
    round,
    setBoard,
    setMessage,
    setPlayer1Hand,
    setPlayer2Hand,
    setPokemonPlacementLocks,
    setFreeReplacementTokens,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
  } = context;
  const { attacker, selectedPokemonCell } = locals;
  const newBoard: BoardState = { ...board };

  Object.entries(newBoard).forEach(([cellName, pokemon]) => {
    if (
      !locals.healAll ||
      !pokemon ||
      pokemon.owner !== attacker.owner ||
      isHealBlocked(pokemon)
    ) {
      return;
    }

    newBoard[cellName] = {
      ...pokemon,
      currentHp: getPokemonMaxHp(pokemon),
    };
  });

  const placementLockKey = getPokemonLockKey(attacker.owner, attacker.card.id);

  if (attacker.card.stage === 'niveau1') {
    setPokemonPlacementLocks((previous) => ({
      ...previous,
      [placementLockKey]: round,
    }));
  }

  if (attacker.card.stage === 'niveau2') {
    setPokemonPlacementLocks((previous) => ({
      ...previous,
      [placementLockKey]: round + 1,
    }));
  }

  // Mode de repose défini par l'attaque (Papilusion : 'normal').
  const replacementMode = locals.returnToHandReplacement ?? 'normal';

  if (replacementMode === 'free') {
    setFreeReplacementTokens((previous) =>
      addFreeReplacementToken(previous, attacker.owner, attacker.card.id)
    );
  }

  const returnedCards = [
    attacker.card,
    ...(attacker.attachedTool ? [attacker.attachedTool] : []),
  ];

  if (attacker.owner === 1) {
    setPlayer1Hand((hand) => [...hand, ...returnedCards]);
  } else {
    setPlayer2Hand((hand) => [...hand, ...returnedCards]);
  }

  newBoard[selectedPokemonCell] = null;
  setBoard(newBoard);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);
  setMessage(
    (locals.healAll
      ? `${attacker.card.name} soigne tous les Pokémon du joueur ${attacker.owner}, puis retourne dans la main`
      : `${attacker.card.name} utilise ${locals.attackName} et retourne dans la main`) +
      (attacker.attachedTool ? ` avec ${attacker.attachedTool.name}.` : '.') +
      getFreeReplacementMessage(attacker.card.name, attacker.card.stage, replacementMode)
  );
}
