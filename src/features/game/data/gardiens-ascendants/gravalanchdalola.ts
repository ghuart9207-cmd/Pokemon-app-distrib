import type { PokemonCard } from '@/features/game/types';

export const gravalanchdalola: PokemonCard = {
  id: 'gravalanchdalola-001',
  name: 'Gravalanch d’Alola',
  stage: 'niveau1',
  variant: 'normal',
  type: 'electrique',
  maxHp: 110,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/gravalanchdalola-card.png'),
  attacks: [
    
    
    {
      name: 'Poing-Eclair',
      damage: 50,
      energyCost: 3,
      requiredEnergies: { electrique: 1,  },
     
 coinCount: 1,
 coinDamageEffects: [ {side: 'face',   condition: 'any',    damage: 20,  } , 
  ],
  coinEffects: [ { side: 'pile',
    effect: {type: 'recoil',
        amount: 20,  }, },],

effectText:  'Lancez une pièce. Si c’est Face, cette attaque inflige 20 dégâts supplémentaires. Si c ’est pile, ce Pokémon s’inflige 20 dégats.' 

 
    },
    {
      name: 'Roulade',
      damage: 80,
      energyCost: 4,
     requiredEnergies: { electrique: 3},
secondaryBenchOrPlayerDamage: 20,
  effectText:    'Cette attaque inflige 20 dégats à l’un des Pokémon de Banc de votre adversaire.',
 
    },
  ],
};