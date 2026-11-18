import type { GameCard, PokemonCard, ScriptCardFilter, ScriptPokemonFilter } from '@/features/game/types';
import { isPokemonCard } from './board-rules';

// =====================================================================
// CODE DES CARTES — ÉTAPE 3 : cartes de la défausse (recoverCards)
// =====================================================================

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** La carte respecte-t-elle les contraintes `cards` ? */
export function matchesCardFilter(card: GameCard, filter: ScriptCardFilter | undefined): boolean {
  if (!filter) return true;

  if (filter.category?.length) {
    const category = isPokemonCard(card)
      ? 'pokemon'
      : card.subtype === 'outil'
        ? 'outil'
        : card.category;
    // Un Outil est aussi un Objet.
    const ok =
      filter.category.includes(category) ||
      (category === 'outil' && filter.category.includes('objet'));
    if (!ok) return false;
  }

  if (filter.names?.length && !filter.names.some((name) => normalize(card.name).startsWith(normalize(name)))) {
    return false;
  }

  const pokemonOnly = filter.pokemonTypes?.length || filter.stages?.length || filter.variants?.length;
  if (pokemonOnly) {
    if (!isPokemonCard(card)) return false;
    if (filter.pokemonTypes?.length && !filter.pokemonTypes.includes(card.type)) return false;
    if (filter.stages?.length && !filter.stages.includes(card.stage)) return false;
    if (filter.variants?.length && !filter.variants.includes(card.variant)) return false;
  }

  return true;
}

/** Cartes de la défausse qu'on peut reprendre (avec leur place dans la défausse). */
export function getRecoverableCards(
  discard: GameCard[],
  filter: ScriptCardFilter | undefined
): { card: GameCard; index: number }[] {
  return discard
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => matchesCardFilter(card, filter));
}

/** summon : le Pokémon respecte-t-il les contraintes `pokemon` ? */
export function matchesSummonFilter(card: PokemonCard, filter: ScriptPokemonFilter | undefined): boolean {
  if (!filter) return true;
  if (filter.pokemonTypes?.length && !filter.pokemonTypes.includes(card.type)) return false;
  if (filter.stages?.length && !filter.stages.includes(card.stage)) return false;
  if (filter.variants?.length && !filter.variants.includes(card.variant)) return false;
  if (filter.names?.length && !filter.names.some((name) => normalize(card.name).startsWith(normalize(name)))) {
    return false;
  }
  if (filter.maxHp !== undefined && card.maxHp > filter.maxHp) return false;
  if (filter.minHp !== undefined && card.maxHp < filter.minHp) return false;
  return true;
}
