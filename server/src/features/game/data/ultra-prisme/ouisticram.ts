import type { PokemonCard } from '@/features/game/types';

export const ouisticram: PokemonCard = {
  id: 'ouisticram-001',
  name: 'Ouisticram',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 40,
  retreatCost: 0,
  artwork: require('../../../../../assets/images/ouisticram-card.png'),
  attacks: [
    
    
    {
      name: 'Flamboiement',
      damage: 20,
      energyCost: 1,
      requiredEnergies: { feu: 1,},

    },
  ],
};