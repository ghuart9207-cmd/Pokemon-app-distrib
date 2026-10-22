import { addFreeReplacementToken, getPokemonMaxHp } from '@/features/game/rules';
import type {
  BoardState,
  PokemonInPlay,
  ReturnToHandReplacement,
} from '@/features/game/types';
import { getFreeReplacementMessage } from '../cell-press/trainer-effects/free-replacement-message';
import type { AttackResolutionContext } from './attack-resolution-context';

/** Attaque qui soigne tous les Pokémon du joueur, puis renvoie l'attaquant dans sa main. */
export function healAllAndReturnToHand(
  context: AttackResolutionContext,
  locals: {
    attacker: PokemonInPlay;
    selectedPokemonCell: string;
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
    if (!pokemon || pokemon.owner !== attacker.owner) {
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
    `${attacker.card.name} soigne tous les Pokémon du joueur ${attacker.owner}, puis retourne dans la main` +
      (attacker.attachedTool ? ` avec ${attacker.attachedTool.name}.` : '.') +
      getFreeReplacementMessage(attacker.card.name, attacker.card.stage, replacementMode)
  );
}
