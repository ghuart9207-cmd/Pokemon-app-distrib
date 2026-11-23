import type { PokemonCard } from '@/features/game/types';

export const cradopaud: PokemonCard = {
  id: 'cradopaud-001',
  name: 'cradopaud',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/cradopaud-card.png'),
  attacks: [
    {
      name: 'Poing Tire-Bouchon',
      damage: 10,
      energyCost: 1,
    },
    {
      name: 'Bond de Grenouille',
      damage: 20,
      energyCost: 2,

      requiredEnergies: {
        psy: 1,
      },

      coinCount: 1,

      coinDamageEffects: [
        {
          side: 'face',
          condition: 'any',
          damage: 20,
        },
      ],

      effectText:
        'Lancez une pièce. Si c’est Face, cette attaque inflige 20 dégâts supplémentaires.',
    },
  ],
};
