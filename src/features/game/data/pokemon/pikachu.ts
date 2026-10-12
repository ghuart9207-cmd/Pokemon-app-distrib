import type { PokemonCard } from '@/features/game/types';

export const pikachu: PokemonCard = {
  id: 'pikachu-001',
  name: 'Pikachu',
  stage: 'base',
  variant: 'normal',
  type: 'electrique',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/pikachu-card.png'),
  attacks: [
    {
      name: 'Queue Battoir',
      damage: 10,
      energyCost: 1,
    },

    {
      name: 'Éclair',
      damage: 20,
      energyCost: 2,

      requiredEnergies: {
        electrique: 1,
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
  ],
};
