import type { PokemonCard } from '@/features/game/types';

export const sovkipou2: PokemonCard = {
  id: 'sovkipou-002',
  name: 'Sovkipou',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 70,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sovkipou2-card.png'),
  attacks: [
    
    {
      name: 'Collision',
      damage: 10,
      energyCost: 1,

      requiredEnergies: {
        plante: 1,
      },
    },
      
    ],
};