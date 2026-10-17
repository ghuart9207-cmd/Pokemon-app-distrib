import type { PokemonCard } from '@/features/game/types';

export const marshadowgx: PokemonCard = {
  id: 'marshadowgx-001',          // unique dans tout le jeu
  name: 'Marshadow GX',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'gx',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 150,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/marshadowgx-card.png'),
  attacks: [
    
    {
      name: 'Dérouillée',
      damage: 120,
      energyCost: 3,
      requiredEnergies: { combat: 2 }, // optionnel : énergies de types précis
    },
  ],
};