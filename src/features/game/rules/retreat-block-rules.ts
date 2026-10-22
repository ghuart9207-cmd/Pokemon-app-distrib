
import type {
  AttackEffect,
  PokemonInPlay,
} from '@/features/game/types';

export function applyTargetRetreatBlock(
  pokemon: PokemonInPlay,
  effects: AttackEffect[] | undefined,
  effectsPrevented: boolean
): PokemonInPlay {
  // Les protections qui bloquent les effets
  // des attaques empêchent aussi cet effet.
  if (effectsPrevented) {
    return pokemon;
  }

  const hasRetreatBlock = effects?.some(
    (effect) =>
      effect.type === 'preventTargetRetreatNextTurn'
  );

  if (!hasRetreatBlock) {
    return pokemon;
  }

  return {
    ...pokemon,
    retreatBlockedUntilOwnTurnEnd: true,
  };
}
