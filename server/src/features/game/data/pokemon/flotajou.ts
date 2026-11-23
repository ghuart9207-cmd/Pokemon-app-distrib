import type { PokemonCard } from '@/features/game/types';

export const flotajou: PokemonCard = {
  id: 'flotajou-001',          // unique dans tout le jeu
  name: 'Flotajou',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/flotajou-card.png'),
  attacks: [
    {
      name: 'Pistolet à O',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { eau: 1 }, 
       

 
         
},
],
};