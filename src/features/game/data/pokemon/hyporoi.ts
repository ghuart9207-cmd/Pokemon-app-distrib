import type { PokemonCard } from '@/features/game/types';

export const hyporoi: PokemonCard = {
  id: 'hyporoi-001',
  name: 'Hyporoi',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 140,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/hyporoi-card.png'),
  attacks: [
    {
      name: 'Saumure',
      damage: 90,
      energyCost: 1,
      requiredEnergies: {
        eau: 1,
      },

      targetMode: 'damagedOpponentOrPlayer',

      effectText:
        'Cette attaque inflige 90 dégâts à l’un des Pokémon de votre adversaire ayant au moins 1 marqueur de dégâts.',
    },
    {
      name: 'Tir Tornade',
      damage: 90,
      energyCost: 1,
      requiredEnergies: {
        eau: 1,
      },

      effects: [
        {
          type: 'discardEnergy',
          amount: 1,
        },
      ],

      secondaryBenchOrPlayerDamage: 30,

      effectText:
        'Défaussez 1 Énergie de ce Pokémon. Cette attaque inflige aussi 30 dégâts à l’un des Pokémon de banc de votre adversaire.',
    },
  ],
};
