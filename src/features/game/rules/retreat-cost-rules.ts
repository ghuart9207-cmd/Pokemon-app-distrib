
import type {
  BoardState,
  PokemonInPlay,
} from '@/features/game/types';
import { isTalentNegated } from './talent-negation';

/**
 * Talent 'freeRetreatForOwnBasePokemon' : vos Pokémon de Base en jeu
 * n'ont pas de coût de retraite (tant qu'un Pokémon avec ce Talent est en jeu).
 */
export function hasFreeRetreatForBasePokemon(
  pokemon: PokemonInPlay,
  board: BoardState | null | undefined
): boolean {
  if (!board || pokemon.card.stage !== 'base') return false;

  return Object.entries(board).some(
    ([cell, other]) =>
      other !== null &&
      other.owner === pokemon.owner &&
      other.card.talent?.type === 'passive' &&
      other.card.talent.effect === 'freeRetreatForOwnBasePokemon' &&
      !isTalentNegated(other, board, cell)
  );
}

/**
 * Calcule le coût réel de retraite d'un Pokémon
 * en tenant compte de ses Talents.
 */
export function getEffectiveRetreatCost(
  pokemon: PokemonInPlay,
  round: number,
  turnId?: number,
  // Talent annulé (Pokémon adverse de la même colonne).
  talentNegated = false,
  // Plateau : pour les Talents d'autres Pokémon (ex : retraite gratuite des Pokémon de Base).
  board?: BoardState
): number {
  if (hasFreeRetreatForBasePokemon(pokemon, board)) {
    return 0;
  }

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

  // Outil : coût de retraite diminué.
  const toolReduction =
    pokemon.attachedTool?.effect === 'toolRetreatMinusOneIgnoreConditions'
      ? (pokemon.attachedTool.retreatCostReduction ?? 1)
      : 0;

  // Sinon, coût normal du Pokémon.
  return Math.max(0, baseRetreatCost - toolReduction);
}
