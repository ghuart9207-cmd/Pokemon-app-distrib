import type { PokemonCard } from '@/features/game/types';

export const herbizarre: PokemonCard = {
  id: 'herbizarre-001',          // unique dans tout le jeu
  name: 'Herbizarre',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 90,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/herbizarre-tcg.png'),
  attacks: [
    {
      name: 'Tranche’Herbe',
      damage: 60,
        
      energyCost: 3,
      requiredEnergies: { plante: 1 }, 
        

      
},
],
};