
import { getKnockoutConsequences } from '@/features/game/rules';
import type { BoardState, PokemonInPlay } from '@/features/game/types';
import type { AttackResolutionContext } from './attack-resolution-context';

// Inflige des dégâts à tous les Pokémon et aux deux joueurs,
// sans appliquer les réductions ni les protections.
export function hitEveryoneIgnoringEffects(
  context: AttackResolutionContext,
  boardAfterAttack: BoardState,
  amount: number,
  attackerName: string,
  attackName: string
): void {
  const {
    prepareKOEnergyMove,
    setBoard,
    setMessage,
    setPlayer1Damage,
    setPlayer2Damage,
    setPlayer1Discard,
    setPlayer2Discard,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
    setSelectedPokemonCell,
    setSelectedAttackIndex,
  } = context;

  const damage = Math.max(0, amount);
  const nextBoard = { ...boardAfterAttack };

  const knockedOutPlayer1: PokemonInPlay[] = [];
  const knockedOutPlayer2: PokemonInPlay[] = [];

  // On parcourt TOUS les Pokémon du plateau.
  for (const [cell, pokemon] of Object.entries(nextBoard)) {
    if (!pokemon) continue;

    const hpAfterDamage = pokemon.currentHp - damage;

    if (hpAfterDamage > 0) {
      nextBoard[cell] = {
        ...pokemon,
        currentHp: hpAfterDamage,
      };
    } else {
      // Pokémon K.O.
      nextBoard[cell] = null;

      if (pokemon.owner === 1) {
        knockedOutPlayer1.push(pokemon);
      } else {
        knockedOutPlayer2.push(pokemon);
      }
    }
  }

  // Calcul des conséquences des K.O.
  const ko1 = getKnockoutConsequences(knockedOutPlayer1);
  const ko2 = getKnockoutConsequences(knockedOutPlayer2);

  // Les énergies récupérables par les Outils.
  for (const pokemon of [
    ...knockedOutPlayer1,
    ...knockedOutPlayer2,
  ]) {
    prepareKOEnergyMove(pokemon, nextBoard);
  }

  // Les deux joueurs prennent les dégâts,
  // plus les pénalités de leurs propres Pokémon K.O.
  setPlayer1Damage(
    (previous) => previous + damage + ko1.penalty
  );

  setPlayer2Damage(
    (previous) => previous + damage + ko2.penalty
  );

  // Défausse des Pokémon et de leurs énergies.
  if (ko1.discardedCards.length > 0) {
    setPlayer1Discard(
      (previous) => [...previous, ...ko1.discardedCards]
    );

    setPlayer1DiscardEnergies(
      (previous) => [...previous, ...ko1.discardedEnergies]
    );
  }

  if (ko2.discardedCards.length > 0) {
    setPlayer2Discard(
      (previous) => [...previous, ...ko2.discardedCards]
    );

    setPlayer2DiscardEnergies(
      (previous) => [...previous, ...ko2.discardedEnergies]
    );
  }

  setBoard(nextBoard);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `${attackerName} utilise ${attackName} : ${damage} dégâts à tous les Pokémon et aux deux joueurs, sans protection !`
  );
}
