import type { PokemonCard } from '@/features/game/types';

export const goupixdalola2: PokemonCard = {
  id: 'goupixdalola-002',          // unique dans tout le jeu
  name: 'Goupix d\'Alola',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/goupixdalola2-card.png'),
  attacks: [
    {
      name: 'Flambeau',
      damage: 0,
      energyCost: 1,
     
       effects: [    { type: 'summonFromInvocationPool', amount: 1, poolSize: 4,  maxHp: 30 },  ],
  effectText:    "Invoquez un Pokémon de Base ayant 30 PV ou moins sur votre banc. Comme ce sont des Invocations, ils arrivent sans Énergie et ne peuvent pas être ciblés par les cartes Dresseur.",

         
},
    

    {
      name: 'Verglas',
      damage: 20,
      energyCost: 2,
      
       

 
         
},
],
};