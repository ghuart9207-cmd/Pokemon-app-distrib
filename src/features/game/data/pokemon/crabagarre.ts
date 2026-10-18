import type { PokemonCard } from '@/features/game/types';

export const crabagarre: PokemonCard = {
  id: 'crabagarre-001',          // unique dans tout le jeu
  name: 'Crabagarre',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/crabagarre-card.png'),
  attacks: [
    
    {
      name: 'Poing Léger',
      damage: 40,
      energyCost: 2,
      requiredEnergies: { combat: 2 }, // optionnel : énergies de types précis
    },
  ],
};