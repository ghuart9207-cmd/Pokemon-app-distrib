import type { PokemonCard } from '@/features/game/types';

export const bombydou: PokemonCard = {
  id: 'bombydou-001',          // unique dans tout le jeu
  name: 'Bombydou',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 30,
  retreatCost: 0,
  artwork: require('../../../../../assets/images/bombydou-card.png'),
  attacks: [
    { name: 'Vent Féérique', damage: 10, energyCost: 1},
    
  ],
};