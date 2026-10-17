import type { PokemonCard } from '@/features/game/types';

export const skelenox: PokemonCard = {
  id: 'skelenox-001',          // unique dans tout le jeu
  name: 'Skelénox',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/skelenox-card.png'),
  attacks: [
    {
      name: 'Tir Effrayant',
      damage: 20,
      energyCost: 2,
      requiredEnergies: { psy: 1 }, 
        

  
         
},
],
};