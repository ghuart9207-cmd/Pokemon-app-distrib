import type { PokemonCard } from '@/features/game/types';

export const flamajou: PokemonCard = {
  id: 'flamajou-001',          // unique dans tout le jeu
  name: 'Flamajou',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'feu',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/flamajou-card.png'),
  attacks: [
    {
      name: 'Flamboiement',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { feu: 1 }, 
       

 
         
},
],
};