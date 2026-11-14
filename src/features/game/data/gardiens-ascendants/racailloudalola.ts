import type { PokemonCard } from '@/features/game/types';

export const racailloudalola: PokemonCard = {
  id: 'racailloudalola-001',
  name: 'Racaillou d’Alola',
  stage: 'base',
  variant: 'normal',
  type: 'electrique',
  maxHp: 70,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/racailloudalola-card.png'),
  attacks: [
    
    
    {
      name: 'Poliroche',
      damage: 0,
      energyCost: 0,
     
effects: [{ type: 'freeRetreatNextOwnTurn', amount: 0 }],
  effectText: "Pendant votre prochain tour, ce Pokémon n'a pas de coût de retraite.",

 
    },
    {
      name: 'Roulade',
      damage: 40,
      energyCost: 3,
     requiredEnergies: { electrique: 1},


 
    },
  ],
};