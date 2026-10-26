import type { PokemonCard } from '@/features/game/types';

export const vorasterie: PokemonCard = {
  id: 'vorasterie-001',
  name: 'Vorastérie',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/vorasterie-card.png'),
  attacks: [
    
    {
      name: 'Pluie Eclaboussante',
      damage: 10,
      energyCost: 1,

      requiredEnergies: { eau: 1,  },
    },
      
    ],
};