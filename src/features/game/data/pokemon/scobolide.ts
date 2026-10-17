import type { PokemonCard } from '@/features/game/types';

export const scobolide: PokemonCard = {
  id: 'scobolide-001',
  name: 'Scobolide',
  stage: 'niveau1',
  variant: 'normal',
  type: 'psy',
  maxHp: 90,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/scobolide-card.png'),
  attacks: [
    {
      name: 'Tournoyer',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { psy: 1 },
      effects: [
        {
          type: 'switchWithBench',
          amount: 1,
        },
      ],

      effectText:
        'Échangez ce Pokémon avec l’un de vos Pokémon de banc situé sur la même ligne.',
    },
    {
      name: 'Roulade',
      damage: 60,
      energyCost: 3,
requiredEnergies: { psy: 2 },
      
    },
  ],
};
