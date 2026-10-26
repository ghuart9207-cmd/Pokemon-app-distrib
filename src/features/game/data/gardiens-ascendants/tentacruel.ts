import type { PokemonCard } from '@/features/game/types';

export const tentacruel: PokemonCard = {
  id: 'tentacruel-001',
  name: 'Tentacruel',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 110,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/tentacruel-card.png'),
  attacks: [
    
    {
      name: 'Dard Venin',
      damage: 30,
      energyCost: 2,

     effects: [
          {
            type: 'poison',
            amount: 1,
          },
        ],
      effectText: 'Le pokémon actif de votre adversaire est maintenant empoisonné.',
    },
    {
      name: 'Tentacules Grouillants',
      damage: 40,
      energyCost: 3,

     coinCount: 1,
 coinDamageEffects: [ {side: 'face',   condition: 'any',    damage: 40,  } , 
  ],
  coinEffects: [ { side: 'pile',
    effect: {type: 'paralyze',
        amount: 1,  }, },],

effectText:  'Lancez une pièce. Si c’est Face, cette attaque inflige 40 dégâts supplémentaires. Si c ’est pile, le Pokémon actif de votre adversaire est maintenant Paralysé.' 

    },
      
    ],
};