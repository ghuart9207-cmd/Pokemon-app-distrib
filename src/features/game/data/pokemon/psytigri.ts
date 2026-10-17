import type { PokemonCard } from '@/features/game/types';

export const psytigri: PokemonCard = {
  id: 'psytigri-001',
  name: 'Psytigri',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/psytigri-card.png'),
  attacks: [
    {
      name: 'Regard Déroutant',
      damage: 0,
      energyCost: 1,
      
      
    },
   
  ],
};