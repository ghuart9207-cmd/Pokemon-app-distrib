
import type {
  PokemonInPlay,
} from '@/features/game/types';

/**
 * Calcule le coût réel de retraite d'un Pokémon
 * en tenant compte de ses Talents.
 */
export function getEffectiveRetreatCost(
  pokemon: PokemonInPlay,
  round: number,
  turnId?: number,
  // Talent annulé (Pokémon adverse de la même colonne).
  talentNegated = false
): number {
  // Effet d'attaque : pas de coût de retraite pendant le prochain tour.
  if (turnId !== undefined && pokemon.freeRetreatTurnId === turnId) {
    return 0;
  }

  const baseRetreatCost =
    pokemon.card.retreatCost;

  const talent = pokemon.card.talent;

  // Talent : retraite gratuite au premier tour
  if (
    !talentNegated &&
    talent?.type === 'passive' &&
    talent.effect === 'freeRetreatOnFirstTurn' &&
    round === 1
  ) {
    return 0;
  }

  // Sinon, coût normal du Pokémon.
  return baseRetreatCost;
}
