import type { PokemonCard } from '@/features/game/types';

export const miaouss: PokemonCard = {
  id: 'miaouss-001',
  name: 'Miaouss',
  stage: 'base',
  variant: 'normal',
  type: 'normal',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/miaouss-card.png'),
  attacks: [
    

    {
      name: 'Bluff',
      damage: 10,
      energyCost: 1,

      

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
