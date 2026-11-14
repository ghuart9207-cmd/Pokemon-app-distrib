import type { PokemonCard } from '@/features/game/types';

export const sharpedo: PokemonCard = {
  id: 'sharpedo-001',
  name: 'Sharpedo',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 90,
  retreatCost: 0,
  artwork: require('../../../../../assets/images/sharpedo-card.png'),
  attacks: [
    
    {
      name: 'Bélier Volant',
      damage: 70,
      energyCost: 2,

      requiredEnergies: {
        eau: 1,
      },
    },
      
    ],
};