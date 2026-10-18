import type { PokemonCard } from '@/features/game/types';

export const flotoutan: PokemonCard = {
  id: 'flotoutan-001',
  name: 'Flotoutan',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/flotoutan-card.png'),
  attacks: [
    {
      name: 'Griffe',
      damage: 30,
      energyCost: 1,
    },
    {
      name: 'Reflet Aquatique',
      damage: 50,
      energyCost: 2,
      requiredEnergies: {
        eau: 1,
      },

       effects: [
    {
      type: 'moveOwnEnergyToBench',
      amount: 1,
      energyType: 'eau',
    },
  ],

  effectText:
    "Déplacez une Énergie Eau de ce Pokémon vers l'un de vos Pokémon de Banc.",
    },
  ],
};
