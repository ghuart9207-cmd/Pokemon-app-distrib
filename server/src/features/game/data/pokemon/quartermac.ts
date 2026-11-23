import type { PokemonCard } from '@/features/game/types';

export const quartermac: PokemonCard = {
  id: 'quartermac-001',          // unique dans tout le jeu
  name: 'Quartermac',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/quartermac-card.png'),
  attacks: [
    { name: 'Koud’Poing', damage: 30, energyCost: 2},
    {
      name: 'Mauvais Lancer',
      damage: 0,
      energyCost: 2,
      requiredEnergies: { combat: 2 }, // optionnel : énergies de types précis
    },
  ],
};