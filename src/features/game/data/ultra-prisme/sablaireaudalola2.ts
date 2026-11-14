import type { PokemonCard } from '@/features/game/types';

export const sablaireaudalola2: PokemonCard = {
  id: 'sablaireaudalola-002',
  name: 'Sablaireau d’Alola',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 120,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sablaireaudalola2-card.png'),
  attacks: [
    
    {
      name: 'Armure Piquante',

      damage: 30,

      energyCost: 1,
      effects: [{ type: 'retaliateDamageNextOpponentTurn', amount: 60 }],
  effectText:
    "Pendant le prochain tour de votre adversaire, si ce Pokémon subit les dégâts d'une attaque , placez 6 marqueurs de dégâts sur le Pokémon attaquant.",

      
    },
    
    {
      name: 'Souffle Glacé',
      damage: 90,
      energyCost: 3,
     requiredEnergies: { eau: 1},


 
    },
  ],
};