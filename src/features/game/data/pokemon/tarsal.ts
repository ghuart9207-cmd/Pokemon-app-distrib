import type { PokemonCard } from '@/features/game/types';

export const tarsal: PokemonCard = {
  id: 'tarsal-001',          // unique dans tout le jeu
  name: 'Tarsal',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tarsal-card.png'),
  attacks: [
    
    {
      name: 'Vampibaiser',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { fee: 1 },
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