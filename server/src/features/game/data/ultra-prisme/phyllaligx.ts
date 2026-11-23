import type { PokemonCard } from '@/features/game/types';

export const phyllaligx: PokemonCard = {
  id: 'phyllali-001',
  name: 'Phyllali GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'plante',
  maxHp: 200,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/phyllaligx-card.png'),
  talent: {
  name: 'Souffle du Feuillage',
  type: 'activated',
  effect: 'healOwnPokemonOncePerTurn',
  amount: 50,  
  description:
    'Une seule fois pendant votre tour, vous pouvez soigner 50 dégâts à l\'un de vos Pokémon.',
},
  attacks: [
    
    {
      name: 'Lance-Soleil',
      damage: 110,
      energyCost: 3,
      requiredEnergies: { plante: 1,
        
      },

      
      

      

  
    },
  ],
};