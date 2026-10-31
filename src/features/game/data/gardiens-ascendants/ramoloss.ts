import type { PokemonCard } from '@/features/game/types';

export const ramoloss: PokemonCard = {
  id: 'ramoloss-001',
  name: 'Ramoloss',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 70,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/ramoloss-card.png'),
  attacks: [
    {
      name: 'Coup d’Boule',
      damage: 10,
      energyCost: 1,
      
    },
    {
      name: 'Charge Bizarre',
      damage: 60,
      energyCost: 3,
      coinCount: 1,
      requiredEnergies: {
        psy: 1,
      },

      failsOn: 'pile',

      effectText: 'Lancez une pièce. Si c’est Pile, cette attaque ne fait rien.',
    },
  ],
};