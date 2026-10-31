import type { PokemonCard } from '@/features/game/types';

export const fragilady: PokemonCard = {
  id: 'fragilady-001',
  name: 'Fragilady',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/fragilady-card.png'),
  attacks: [
    
    {
      name: 'Tempete Florale',
      damage: 0,
      energyCost: 1,

     effects: [{ type: 'damageAllOpponentPokemonAndPlayer', amount: 10 }],
  effectText: 'Cette attaque inflige 10 dégâts à chacun des Pokémon de votre adversaire.',
},

      

      
    
    {
      name: 'Danse Fleur',
      damage: 0,
      energyCost: 3,

      requiredEnergies: {
        plante: 1,
      },

       coinCount: 3, damagePerFace: 40,
        effectText:  "Lancez 3 pièces. Cette attaque inflige 40 dégats pour chaque coté face.",
    },
  ],
};