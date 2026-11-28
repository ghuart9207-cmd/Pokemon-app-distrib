import type { PokemonCard } from '@/features/game/types';

export const mewtwoextcg: PokemonCard = {
  id: 'mewtwoextcg-001',
  name: 'Mewtwo EX',
  stage: 'base',
  variant: 'ex',
  type: 'psy',
  maxHp: 150,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/mewtwoex-tcg.png'),
  
  attacks: [
   {
      name: 'Tir Effrayant',
      damage: 100,
      energyCost: 3,
      requiredEnergies: {
        psy: 3,
      },
      
    },
    {
      name: 'Tir Effrayant',
      damage: 100,
      energyCost: 3,
      requiredEnergies: {
        psy: 3,
      },
      
    },
    
  ],
};