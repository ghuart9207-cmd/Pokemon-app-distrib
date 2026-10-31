import type { BoardState, Player, PokemonCard, PokemonInPlay } from '@/features/game/types';

/**
 * Talent 'negateOpponentGxExTalents' : les Pokémon-GX et Pokémon-EX adverses
 * qui sont sur la MÊME COLONNE que ce Pokémon n'ont plus de Talent
 * (tant que ce Pokémon reste en jeu sur cette colonne).
 */
export const NEGATE_GX_EX_TALENTS = 'negateOpponentGxExTalents';

/**
 * Le Talent d'une carte posée (ou à poser) en `cell` par `owner`
 * est-il annulé par un Pokémon adverse de la même colonne ?
 */
export function isTalentNegatedAt(
  board: BoardState,
  cell: string | null | undefined,
  owner: Player,
  card: PokemonCard
): boolean {
  if (!cell || (card.variant !== 'gx' && card.variant !== 'ex')) {
    return false;
  }

  const column = cell.slice(1);

  return Object.entries(board).some(
    ([otherCell, other]) =>
      other !== null &&
      otherCell !== cell &&
      otherCell.slice(1) === column &&
      other.owner !== owner &&
      other.card.talent?.effect === NEGATE_GX_EX_TALENTS
  );
}

/** Retrouve la case d'un Pokémon sur le plateau (même objet, sinon même carte et même joueur). */
export function findPokemonCell(board: BoardState, pokemon: PokemonInPlay): string | null {
  const entries = Object.entries(board);

  const sameObject = entries.find(([, other]) => other === pokemon);
  if (sameObject) return sameObject[0];

  const sameCard = entries.find(
    ([, other]) => other !== null && other.card === pokemon.card && other.owner === pokemon.owner
  );
  return sameCard ? sameCard[0] : null;
}

/** Le Talent de ce Pokémon en jeu est-il annulé ? (`cell` facultatif : retrouvé sur le plateau) */
export function isTalentNegated(
  pokemon: PokemonInPlay | null | undefined,
  board: BoardState | null | undefined,
  cell?: string | null
): boolean {
  if (!pokemon || !board) return false;

  return isTalentNegatedAt(board, cell ?? findPokemonCell(board, pokemon), pokemon.owner, pokemon.card);
}
