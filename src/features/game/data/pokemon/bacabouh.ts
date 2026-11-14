import type { PokemonCard } from '@/features/game/types';

export const bacabouh: PokemonCard = {
  id: 'bacabouh-001',          // unique dans tout le jeu
  name: 'Bcabouh',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/bacabouh-card.png'),
  attacks: [
    
    {
      name: 'Absorption',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { psy: 1 },
         effects: [
        {
          type: 'heal',
          amount: 10,
        },
    ],
    effectText:
    'Soignez 10 dégâts à ce pokémon.',

    },
  ],
};