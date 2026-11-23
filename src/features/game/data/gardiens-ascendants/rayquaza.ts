import type { PokemonCard } from '@/features/game/types';

export const rayquaza: PokemonCard = {
  id: 'rayquaza-001',

  name: 'Rayquaza',

  stage: 'base',

  variant: 'normal',

  type: 'normal',

  maxHp: 120,

  retreatCost: 1,

  artwork: require('../../../../../assets/images/rayquaza-card.png'),

  attacks: [
    {
      name: 'Tempete Turbo',

      damage: 30,

      energyCost: 2,
      
script: [
     { action: 'attachEnergy', amount: 2,  fromDiscard: true,  target: { side: 'own', who: 'chosen' } },],
  effectText:
    'Attachez 2 Energies de votre pile de défausse à l’un de vos Pokémon de Banc.',
    },
     {
      name: 'Dracogriffe',

      damage: 80,

      energyCost: 3,
      

    },
  ],
};