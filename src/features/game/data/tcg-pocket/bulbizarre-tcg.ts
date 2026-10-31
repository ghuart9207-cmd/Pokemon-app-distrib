import type { PokemonCard } from '@/features/game/types';

export const bulbizarretcg: PokemonCard = {
  id: 'bulbizarretcg-001',
  name: 'Bulbizarre',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/bulbizarre-tcg.png'),
  attacks: [
    {
      name: 'Fouet Liane',
      damage: 40,
      energyCost: 2,
      
      requiredEnergies: {
        plante: 1,
      },

    },
  ],
};