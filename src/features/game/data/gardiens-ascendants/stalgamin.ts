import type { PokemonCard } from '@/features/game/types';

export const stalgamin: PokemonCard = {
  id: 'stalgamin-001',
  name: 'Stalgamin',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 60,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/stalgamin-card.png'),
  attacks: [
    
    {
      name: 'Glacial',
      damage: 10,
      energyCost: 1,

      requiredEnergies: {
        eau: 1,
      },
    },
    {
      name: 'Souffle Glacé',
      damage: 20,
      energyCost: 2,

      requiredEnergies: {
        eau: 2,
      },
    },
      
    ],
};