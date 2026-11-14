import type { PokemonCard } from '@/features/game/types';

export const riolu: PokemonCard = {
  id: 'riolu-001',          // unique dans tout le jeu
  name: 'Riolu',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/riolu-card.png'),
  attacks: [
    { name: 'Koud’Poing', damage: 10, energyCost: 1,
         requiredEnergies: { combat: 1 },
    },
    {
      name: 'Balayage',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { combat: 2 }, // optionnel : énergies de types précis
    },
  ],
};