import type { PokemonCard } from '@/features/game/types';

export const teraclope: PokemonCard = {
  id: 'teraclope-001',
  name: 'Téraclope',
  stage: 'niveau1',
  variant: 'normal',
  type: 'psy',
  maxHp: 90,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/teraclope-card.png'),
  attacks: [
    {
      name: 'Errance Nocturne',
      damage: 0,
      energyCost: 1,
       requiredEnergies: {
        psy: 1,
      },
      effects: [
    {
      type: 'damageEveryoneIgnoringEffects',
      amount: 10,
    },
  ],

  effectText:
    'Placez 1 marqueur de dégats sur chaque Pokémon (Y compris les joueurs).',
},
    
    {
      name: 'Embuscade',
      damage: 30,
      energyCost: 3,

      requiredEnergies: {
        psy: 1,
      },

      coinCount: 1,

      coinDamageEffects: [
        {
          side: 'face',
          condition: 'any',
          damage: 30,
        },
      ],

      effectText:
        'Lancez une pièce. Si c’est Face, cette attaque inflige 30 dégâts supplémentaires.',
    },
  ],
};