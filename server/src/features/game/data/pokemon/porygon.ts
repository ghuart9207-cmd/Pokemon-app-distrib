import type { PokemonCard } from '@/features/game/types';

export const porygon: PokemonCard = {
  id: 'porygon-001',          // unique dans tout le jeu
  name: 'Porygon',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'normal',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/porygon-card.png'),
  attacks: [
    { name: 'Rayon', damage: 10, energyCost: 1},
    
  ],
};