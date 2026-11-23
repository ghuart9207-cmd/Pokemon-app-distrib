import type { PokemonCard } from '@/features/game/types';

export const melancolux: PokemonCard = {
  id: 'melancolux-001',
  name: 'Mélancolux',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 80,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/melancolux-card.png'),
  attacks: [
    
    {
      name: 'Feu Follet',
      damage: 30,
      energyCost: 1,

      requiredEnergies: {
        feu: 1,
      },
    },
      
    ],
};