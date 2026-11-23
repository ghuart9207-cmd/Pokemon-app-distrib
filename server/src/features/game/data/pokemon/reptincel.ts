import type { PokemonCard } from '@/features/game/types';

export const reptincel: PokemonCard = {
  id: 'reptincel-001',
  name: 'Reptincel',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 90,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/reptincel-card.png'),
  attacks: [
    {
      name: 'Tranch-Griffe',
      damage: 30,
      energyCost: 2,
    },
    {
      name: 'Explosion de Chaleur',
      damage: 70,
      energyCost: 3,

      requiredEnergies: {
        feu: 2,
      },
    },
  ],
};
