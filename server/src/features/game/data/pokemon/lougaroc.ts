import type { PokemonCard } from '@/features/game/types';

export const lougaroc: PokemonCard = {
  id: 'lougaroc-001',          // unique dans tout le jeu
  name: 'Lougaroc',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/lougaroc-card.png'),
  attacks: [
    { name: 'Jet-Pierre', damage: 30, energyCost: 2,requiredEnergies: { combat: 2 },},
    {
      name: 'Vif Roc',
      damage: 100,
      energyCost: 3,
      requiredEnergies: { combat: 2 }, // optionnel : énergies de types précis
    },
  ],
};