import type { PokemonCard } from '@/features/game/types';

export const araqua: PokemonCard = {
  id: 'araqua-001',
  name: 'Araqua',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/araqua-card.png'),
  attacks: [
    
    {
      name: 'Embuscade',
      damage: 10,
      energyCost: 1,

      requiredEnergies: {
        plante: 1,
      },

      coinCount: 1,

      coinDamageEffects: [
        {
          side: 'face',
          condition: 'any',
          damage: 10,
        },
      ],

      effectText:
        'Lancez une pièce. Si c’est Face, cette attaque inflige 10 dégâts supplémentaires.',
    },
  ],
};