import type { PokemonCard } from '@/features/game/types';

export const galvaran: PokemonCard = {
  id: 'galvaran-001',
  name: 'Galvaran',
  stage: 'base',
  variant: 'normal',
  type: 'electrique',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/galvaran-card.png'),
  attacks: [
    

    {
      name: 'Éclair',
      damage: 10,
      energyCost: 1,

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
