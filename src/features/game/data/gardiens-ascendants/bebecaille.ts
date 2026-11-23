import type { PokemonCard } from '@/features/game/types';

export const bebecaille: PokemonCard = {
  id: 'bebecaille-001',

  name: 'Bébécaille',

  stage: 'base',

  variant: 'normal',

  type: 'dragon',

  maxHp: 60,

  retreatCost: 2,
dragonEnergyTypes: ['electrique', 'combat'],
  artwork: require('../../../../../assets/images/bebecaille-card.png'),
 talent: {
  name: 'Pare-Balles',
  type: 'passive',
  effect: 'reduceAllAttackDamage',
  amount: 10,
  description: 'Ce Pokémon subit 10 dégâts de moins provenant des attaques.',
},
  attacks: [
   
     {
      name: 'Dracogriffe',

      damage: 30,

      energyCost: 2,
      requiredEnergies: {electrique: 1, combat: 1},

    },
  ],
};