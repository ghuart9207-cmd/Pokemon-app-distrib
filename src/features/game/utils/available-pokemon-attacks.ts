import type {
  Attack,
  GameCard,
  PokemonInPlay,
} from '@/features/game/types';

export type AvailablePokemonAttack = {
  attack: Attack;
  copiedFromDiscard: boolean;
  sourcePokemonName?: string;
};

/**
 * Renvoie les attaques normales du Pokémon et, si son Talent le permet,
 * les attaques des Pokémon de Base de sa propre défausse.
 *
 * Pour les attaques copiées, seul le nombre d'Énergies est requis :
 * les exigences de types sont retirées, mais les effets de l'attaque
 * sont conservés.
 */
export function getAvailablePokemonAttacks(
  pokemon: PokemonInPlay,
  ownDiscard: GameCard[]
): AvailablePokemonAttack[] {
  const normalAttacks: AvailablePokemonAttack[] =
    pokemon.card.attacks.map((attack) => ({
      attack,
      copiedFromDiscard: false,
    }));

  if (
    pokemon.card.talent?.effect !==
    'useBasicPokemonDiscardAttacks'
  ) {
    return normalAttacks;
  }

  const copiedAttacks: AvailablePokemonAttack[] =
    ownDiscard.flatMap((card) => {
      // Les cartes Dresseur ne possèdent pas de stade ni d'attaques.
      if (!('stage' in card) || card.stage !== 'base') {
        return [];
      }

      return card.attacks.map((attack) => ({
        attack: {
          ...attack,

          // Les types d'Énergies ne sont pas exigés pour une attaque copiée.
          // energyCost reste inchangé : le nombre d'Énergies est conservé.
          requiredEnergies: undefined,
        },
        copiedFromDiscard: true,
        sourcePokemonName: card.name,
      }));
    });

  return [...normalAttacks, ...copiedAttacks];
}