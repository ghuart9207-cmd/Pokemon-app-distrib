import type { PokemonCard } from '@/features/game/types';

export const draieul2: PokemonCard = {
  id: 'draieul-002',

  name: 'Draieul',

  stage: 'base',

  variant: 'normal',

  type: 'dragon',

  maxHp: 130,

  retreatCost: 3,
dragonEnergyTypes: ['normal', 'normal'],
  artwork: require('../../../../../assets/images/draieul2-card.png'),

  attacks: [
    {
      name: 'Amas',

      damage: 0,

      energyCost: 1,
      
script: [
     { action: 'attachEnergy', amount: 1, energyType: 'normal', target: { who: 'self' } },],
  effectText:
    'Attachez une Energie normal à ce Pokémon.',
    },
     {
      name: 'Cyclone d’Energie',

      damage: 80,

      energyCost: 3,
      
script: [ { action: 'moveEnergy', amount: 1, target: { who: 'self' }, to: { } } ],
      effectText:
    'Déplacez une Energie normal de ce Pokémon vers l’un de vos Pokémon de Banc.',
    },
  ],
};