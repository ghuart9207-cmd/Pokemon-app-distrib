import type { PokemonCard } from '@/features/game/types';

export const chlorobule: PokemonCard = {
  id: 'chlorobule-001',          // unique dans tout le jeu
  name: 'Chlorobule',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/chlorobule-card.png'),
  attacks: [
    
    {
      name: 'Paté',
      damage: 10,
      energyCost: 1,
      
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