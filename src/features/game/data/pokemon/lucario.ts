import type { PokemonCard } from '@/features/game/types';

export const lucario: PokemonCard = {
  id: 'lucario-001',          // unique dans tout le jeu
  name: 'Lucario',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 120,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/lucario-card.png'),
  attacks: [
    
    {
      name: 'Coup Sous-Marin',
      damage: 120,
      energyCost: 3,
      requiredEnergies: { combat: 3 }, // optionnel : énergies de types précis
    },
  ],
};