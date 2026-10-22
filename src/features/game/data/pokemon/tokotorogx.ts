import type { PokemonCard } from '@/features/game/types';

export const tokotorogx: PokemonCard = {
  id: 'tokotorogx-001',
  name: 'Tokotoro Gx',
  stage: 'base',
  variant: 'gx',
  type: 'plante',
  maxHp: 180,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/tokotorogx-card.png'),
  attacks: [
    {
      name: 'Koud’Korn',
      damage: 30,
      energyCost: 1,
    requiredEnergies: { plante: 1,
      },
      
    },
    {
      name: 'Jugement de la Nature',
      damage: 120,
      energyCost: 3,
requiredEnergies: { plante: 2,
      },
     effects: [
  {
    type: 'discardAllEnergyForBonus',
    amount: 60,
  },
],
effectText:
  'Vous pouvez défausser toutes les Énergies attachées à ce Pokémon. Dans ce cas, cette attaque inflige 60 dégâts supplémentaires.',
    },
  ],
};