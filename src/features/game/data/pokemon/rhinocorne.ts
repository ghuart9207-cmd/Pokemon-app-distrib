import type { PokemonCard } from '@/features/game/types';

export const rhinocorne: PokemonCard = {
  id: 'rhinocorne-001',          // unique dans tout le jeu
  name: 'Rhinocorne',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/rhinocorne-card.png'),
  attacks: [
    { name: 'Allonger', damage: 20, energyCost: 2},
    {
      name: 'Empal’Korn',
      damage: 60,
      energyCost: 3,
      requiredEnergies: { combat: 2 }, // optionnel : énergies de types précis
    },
  ],
};