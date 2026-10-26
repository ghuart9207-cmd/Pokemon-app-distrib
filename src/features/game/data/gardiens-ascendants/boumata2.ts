import type { PokemonCard } from '@/features/game/types';

export const boumata2: PokemonCard = {
  id: 'boumata-002',
  name: 'Boumata',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 110,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/boumata2-card.png'),
  attacks: [
    
    
    {
      name: 'Plaquage',
      damage: 30,
      energyCost: 1,
      

      coinCount: 1,
 
coinEffects: [ { side: 'face',
    effect: {type: 'paralyze',
        amount: 1,  }, },],
effectText: 'Lancez une pièce. Si c’est Face, le Pokémon adverse est Paralysé.' 

    },
    {
      name: 'Explosion de Chaleur',
      damage: 90,
      energyCost: 3,
      requiredEnergies: { feu: 2,},

      
    },
  ],
};