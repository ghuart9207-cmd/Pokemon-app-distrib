import type { PokemonCard } from '@/features/game/types';

export const carvanha: PokemonCard = {
  id: 'carvanha-001',
  name: 'Carvanha',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 50,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/carvanha-card.png'),
  attacks: [
    
    {
      name: 'Morsure',
      damage: 10,
      energyCost: 1,

      requiredEnergies: {
        eau: 1,
      },
    },
      
    ],
};