import type { PokemonCard } from '@/features/game/types';

export const sablaireaudalola: PokemonCard = {
  id: 'sablaireaudalola-001',
  name: 'Sablaireau d’Alola',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 110,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sablaireaudalola-card.png'),
  attacks: [
    
    
    
    {
      name: 'Tour Fracassant',
      damage: 50,
      energyCost: 3,
     requiredEnergies: { eau: 1},


 
    },
  ],
};