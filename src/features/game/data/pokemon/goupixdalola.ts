import type { PokemonCard } from '@/features/game/types';

export const goupixdalola: PokemonCard = {
  id: 'goupixdalola-001',          // unique dans tout le jeu
  name: 'Goupix d\'Alola',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/goupixdalola-card.png'),
  attacks: [
    {
      name: 'Poudreuse',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { eau: 1}, 
       effects: [
          {
            type: 'sleep',
            amount: 1,
          },
        ],

 effectText: 'Le pokémon actif de votre adversaire est maintenant endormi.' 
         
},
    

    {
      name: 'Verglas',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { eau: 2 }, 
       

 
         
},
],
};