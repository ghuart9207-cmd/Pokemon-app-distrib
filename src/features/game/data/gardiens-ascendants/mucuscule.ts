import type { PokemonCard } from '@/features/game/types';

export const mucuscule: PokemonCard = {
  id: 'mucuscule-001',
  name: 'Mucuscule',
  stage: 'base',
  variant: 'normal',
  type: 'dragon',
  maxHp: 50,
  retreatCost: 1,
  dragonEnergyTypes: ['eau', 'fee'],
  artwork: require('../../../../../assets/images/mucuscule-card.png'),
  attacks: [
    

    {
      name: 'Ecume',
      damage: 0,
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
    {
      name: 'Charge',
      damage: 20,
      energyCost: 2,
      requiredEnergies: {
        eau: 1,
        fee: 1,
      },
    },
  ],
};
