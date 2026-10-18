import type { PokemonCard } from '@/features/game/types';

export const lamperoie: PokemonCard = {
  id: 'lamperoie-001',          // unique dans tout le jeu
  name: 'Lamperoie',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'electrique',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 90,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/lamperoie-card.png'),
  attacks: [
    {
      name: 'Ronge',
      damage: 50,
      energyCost: 2,
      requiredEnergies: { electrique: 1 }, 
       
},
],
};