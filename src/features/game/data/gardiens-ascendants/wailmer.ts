import type { PokemonCard } from '@/features/game/types';

export const wailmer: PokemonCard = {
  id: 'wailmer-001',
  name: 'Wailmer',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 120,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/wailmer-card.png'),
  attacks: [
    
    {
      name: 'Trempette',
      damage: 20,
      energyCost: 2,

      requiredEnergies: {
        eau: 1,
      },
    },
    {
      name: 'Surf',
      damage: 70,
      energyCost: 4,

      requiredEnergies: {
        eau: 3,
      },
    },
      
    ],
};