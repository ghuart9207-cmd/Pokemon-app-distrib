import type { PokemonCard } from '@/features/game/types';

export const feuiloutan: PokemonCard = {
  id: 'feuiloutan-001',
  name: 'Feuiloutan',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/feuiloutan-card.png'),
  attacks: [
    {
      name: 'Griffe',
      damage: 30,
      energyCost: 1,
    },
    {
      name: 'Provision de Feuillage',
      damage: 50,
      energyCost: 2,
      requiredEnergies: {
        plante: 1,
      },

      effects: [
        {
          type: 'attachEnergyToBench',

          amount: 1,

          energyType: 'plante',
        },
      ],

      effectText: 'Attachez une Énergie Plante à l’un de vos Pokémon de banc.',
    },
  ],
};
