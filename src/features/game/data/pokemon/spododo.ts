import type { PokemonCard } from '@/features/game/types';

export const spododo: PokemonCard = {
  id: 'spododo-001',          // unique dans tout le jeu
  name: 'Spododo',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/spododo-card.png'),
  attacks: [
    { name: 'Collision', damage: 10, energyCost: 1},
    
  ],
};