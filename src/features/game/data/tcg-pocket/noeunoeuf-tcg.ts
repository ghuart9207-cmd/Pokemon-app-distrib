import type { PokemonCard } from '@/features/game/types';

export const noeunoeuftcg: PokemonCard = {
  id: 'noeunoeuftcg-001',
  name: 'Noeunoeuf',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 50,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/noeunoeuf-tcg.png'),
  attacks: [
    {
      name: 'Canon Graine',
      damage: 20,
      energyCost: 1,
      
      requiredEnergies: {
        plante: 1,
      },

    },
  ],
};