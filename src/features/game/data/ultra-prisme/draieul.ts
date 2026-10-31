import type { PokemonCard } from '@/features/game/types';

export const draieul: PokemonCard = {
  id: 'draieul-001',

  name: 'Draieul',

  stage: 'base',

  variant: 'normal',

  type: 'normal',

  maxHp: 130,

  retreatCost: 3,

  artwork: require('../../../../../assets/images/draieul-card.png'),

  attacks: [
    {
      name: 'Colère',

      damage: 20,

      energyCost: 2,
      

      effects: [
    {
      type: 'damagePerSelfDamageCounter',
      amount: 10,      // dégâts en plus par marqueur
    },
  ],
  effectText:
    'Cette attaque inflige 10 dégâts supplémentaires pour chaque marqueur de dégâts placé sur ce Pokémon.',
    },
     {
      name: 'Dracochoc',

      damage: 100,

      energyCost: 3,
      

     
    },
  ],
};