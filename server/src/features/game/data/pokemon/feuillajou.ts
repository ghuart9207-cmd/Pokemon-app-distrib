import type { PokemonCard } from '@/features/game/types';

export const feuillajou: PokemonCard = {
  id: 'feuillajou-001',          // unique dans tout le jeu
  name: 'Feuillajou',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/feuillajou-card.png'),
  attacks: [
    {
      name: 'Fouet Lianes',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { plante: 1 }, 
       

 
         
},
],
};