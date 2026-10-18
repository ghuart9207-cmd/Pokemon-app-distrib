import type { PokemonCard } from '@/features/game/types';

export const sepiatop: PokemonCard = {
  id: 'sepiatop-001',
  name: 'Sepiatop',
  stage: 'base',
  variant: 'normal',
  type: 'obscurite',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/sepiatop-card.png'),
  attacks: [
    

    {
      name: 'Constriction',
      damage: 0,
      energyCost: 1,

      requiredEnergies: {
        obscurite: 1,
      },

      coinCount: 1,

      coinEffects: [
        {
          side: 'face',
          effect: {
            type: 'paralyze',
            amount: 1,
          },
        },
      ],
      effectText: 'Lancez une pièce. Si c’est Face, le Pokémon adverse est Paralysé.',
    },
    {
      name: 'Charge',
      damage: 20,
      energyCost: 2,
    },
  ],
};
