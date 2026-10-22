import type {
  BoardState,
  GameCard,
  Player,
  PokemonCard,
  PokemonInPlay,
} from '@/features/game/types';

export function getPassiveEnergyLimit(card: PokemonCard): number {
  if (card.attacks.length === 0) {
    return 0;
  }

  return Math.max(...card.attacks.map((attack) => attack.energyCost));
}

export function canPlacePokemon(card: PokemonCard, round: number) {
  if (card.stage === 'base') {
    return true;
  }

  if (card.stage === 'niveau1' || card.stage === 'mega_ex') {
    return round >= 2;
  }

  if (card.stage === 'niveau2') {
    return round >= 3;
  }

  return false;
}

export function isPokemonCard(card: GameCard): card is PokemonCard {
  return 'stage' in card;
}

export function getPokemonMaxHp(pokemon: PokemonInPlay): number {
  let maxHp = pokemon.card.maxHp;

  if (pokemon.attachedTool?.effect === 'toolHp40') {
    maxHp += 40;
  }

  return maxHp;
}

/** Les 16 cases du plateau (lignes A à D, colonnes 1 à 4). */
export const BOARD_CELLS = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'C1',
  'C2',
  'C3',
  'C4',
  'D1',
  'D2',
  'D3',
  'D4',
];

/** Dégâts infligés par défaut par le talent « damageOpponentOnPlay ». */
const DEFAULT_DAMAGE_ON_PLAY = 30;

/** Dégâts dont le talent « damageOpponentOnPlay » des Pokémon adverses déjà en jeu frappe un joueur qui pose un Pokémon. */
export function getOpponentPlacementDamage(
  board: BoardState,
  placingPlayer: Player
): number {
  return Object.values(board).reduce((total, pokemon) => {
    if (!pokemon || pokemon.owner === placingPlayer) {
      return total;
    }

    const { talent } = pokemon.card;

    if (talent?.type === 'passive' && talent.effect === 'damageOpponentOnPlay') {
      return total + (talent.amount ?? DEFAULT_DAMAGE_ON_PLAY);
    }

    return total;
  }, 0);
}

/** Clé d'un Pokémon pour les blocages de repose et les reposes gratuites. */
export function getPokemonPlacementKey(player: Player, cardId: string): string {
  return `${player}-${cardId}`;
}

/**
 * Un Pokémon renvoyé en main (Margie, Super Rappel) gagne une repose gratuite :
 * elle s'ajoute à la pose normale du tour, mais le Pokémon arrive sans Énergie.
 */
export function addFreeReplacementToken(
  tokens: Record<string, number>,
  player: Player,
  cardId: string
): Record<string, number> {
  const key = getPokemonPlacementKey(player, cardId);

  return { ...tokens, [key]: (tokens[key] ?? 0) + 1 };
}
