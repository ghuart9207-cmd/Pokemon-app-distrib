import type { PokemonCard } from '@/features/game/types';

export const togedemaru: PokemonCard = {
  id: 'togedemaru-001',
  name: 'Togedemaru',
  stage: 'base',
  variant: 'normal',
  type: 'electrique',
  maxHp: 80,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/togedemaru-card.png'),
  attacks: [
    {
      name: 'Roulade',
      damage: 20,
      energyCost: 1,
      requiredEnergies: {
        electrique: 1,
      },
    },
    {
      name: 'Electro Impact',
      damage: 40,
      energyCost: 2,

      requiredEnergies: {
        electrique: 1,
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