import type { PokemonCard } from '@/features/game/types';

export const flamoutan: PokemonCard = {
  id: 'flamoutan-001',
  name: 'Flamoutan',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/flamoutan-card.png'),
  attacks: [
    {
      name: 'Griffe',
      damage: 30,
      energyCost: 1,
    },
    {
      name: 'Flambée Rechargée',
      damage: 50,
      energyCost: 2,
      requiredEnergies: {
        feu: 1,
      },

      effects: [
        {
          type: 'recoverEnergyToBench',
          amount: 1,
          energyType: 'feu',
        },
      ],

      effectText:
        'Attachez 1 Énergie Feu de votre pile de défausse à l’un de vos Pokémon de banc.',
    },
  ],
};
