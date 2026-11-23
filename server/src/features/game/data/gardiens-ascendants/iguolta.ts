import type { PokemonCard } from '@/features/game/types';

export const iguolta: PokemonCard = {
  id: 'iguolta-001',
  name: 'Iguolta',
  stage: 'niveau1',
  variant: 'normal',
  type: 'electrique',
  maxHp: 100,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/iguolta-card.png'),
  attacks: [
    
    {
      name: 'Vive-Attaque',
      damage: 20,
      energyCost: 1,

     coinCount: 1,
 coinDamageEffects: [ {side: 'face',   condition: 'any',    damage: 20,  } , 
  ],
  

effectText:  'Lancez une pièce. Si c’est Face, cette attaque inflige 20 dégâts supplémentaires.'
    },
    {
      name: 'Tonnerre Déchainé',
      damage: 120,
      energyCost: 3,
requiredEnergies: { electrique: 1,  },
     effects: [{ type: 'damageOneOwnBenchPokemon', amount: 30 }],
  effectText: "Cette attaque inflige 30 dégâts à l'un de vos Pokémon de banc.",

    },
      
    ],
};