import type { PokemonCard } from '@/features/game/types';

export const azumarill: PokemonCard = {
  id: 'azumarill-001',
  name: 'Azumarill',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 120,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/azumarill-card.png'),
  
talent: {
  name: 'Isograisse',
  type: 'passive',
  effect: 'reduceDamageFromFireWater',
  amount: 30,
  description:
    'Ce Pokémon subit 30 dégâts de moins provenant des attaques des Pokémon de type Feu et Eau.',
},

  attacks: [
    
    {
      name: 'Cascade',
      damage: 80,
      energyCost: 3,
      requiredEnergies: {
        eau: 1,
      },

       
    },
  ],
};