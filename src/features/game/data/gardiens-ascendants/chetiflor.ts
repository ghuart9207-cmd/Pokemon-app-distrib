import type { PokemonCard } from '@/features/game/types';

export const chetiflor: PokemonCard = {
  id: 'chetiflor-001',
  name: 'Chétiflor',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/chetiflor-card.png'),
  attacks: [
    
    {
      name: 'Fouet Liane',
      damage: 30,
      energyCost: 2,

      requiredEnergies: {
        plante: 1,
      },
    },
      
    ],
};