import type { PokemonCard } from '@/features/game/types';

export const sovkipou: PokemonCard = {
  id: 'sovkipou-001',          // unique dans tout le jeu
  name: 'Sovkipou',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/sovkipou-card.png'),
  attacks: [
    {
      name: 'Ronge',
      damage: 30,
      energyCost: 3,
      requiredEnergies: { plante: 1 }, 
       
},
],
};