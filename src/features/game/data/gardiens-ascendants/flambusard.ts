import type { PokemonCard } from '@/features/game/types';

export const flambusard: PokemonCard = {
  id: 'flambusard-001',

  name: 'Flambusard',

  stage: 'niveau2',

  variant: 'normal',

  type: 'normal',

  maxHp: 130,

  retreatCost: 0,

  artwork: require('../../../../../assets/images/flambusard-card.png'),

  attacks: [
    {
      name: 'Nitrocharge',

      damage: 30,

      energyCost: 1,
      
script: [
     { action: 'attachEnergy', amount: 1, energyType: 'feu', target: { who: 'self' } },],
  effectText:
    'Attachez une Energie feu à ce Pokémon.',
    },
     {
      name: 'Looping',

      damage: 90,

      energyCost: 2,
      
effects: [
        {
          type: 'discardEnergy',
          amount: 99,
        },
      ],
      effectText:
    'Défaussez toutes les Energies de ce Pokémon.',
    },
  ],
};