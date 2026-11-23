import type { PokemonCard } from '@/features/game/types';

export const tiboudet: PokemonCard = {
  id: 'tiboudet-001',
  name: 'tiboudet',
  stage: 'base',
  variant: 'normal',
  type: 'combat',
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/tiboudet-card.png'),
  attacks: [
    
    {
      name: 'Ecrasement',
      damage: 20,
      energyCost: 2,

      requiredEnergies: {
        combat: 1,
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