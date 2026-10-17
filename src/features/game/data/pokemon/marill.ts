import type { PokemonCard } from '@/features/game/types';

export const marill: PokemonCard = {
  id: 'marill-001',
  name: 'Marill',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/marill-card.png'),
  attacks: [
   

    {
      name: 'Écume',
      damage: 0,
      energyCost: 1,

      requiredEnergies: {
        eau: 1,
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
      name: 'Roulade',
      damage: 20,
      energyCost: 2,
    },
  ],
};