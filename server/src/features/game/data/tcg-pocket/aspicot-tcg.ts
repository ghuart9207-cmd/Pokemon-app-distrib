import type { PokemonCard } from '@/features/game/types';

export const aspicottcg: PokemonCard = {
  id: 'aspicottcg-001',
  name: 'Aspicot',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 50,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/aspicot-tcg.png'),
  attacks: [
    {
      name: 'Multiplication',
      damage: 0,
      energyCost: 1,
      
      requiredEnergies: {
        plante: 1,
      },
 effects: [
        {
          type: 'summonPokemon',
          amount: 1,
          summonCardId: 'aspicottcg-001',
        },
      ],
      effectText:
        "Invoquez un Aspicot sur votre banc. Comme c'est une Invocation, il arrive sans Énergie et ne peut pas être ciblé par les cartes Dresseur.",
    },
  ],
};