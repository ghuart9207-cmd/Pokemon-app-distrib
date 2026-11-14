import type { PokemonCard } from '@/features/game/types';

export const florizarretcg: PokemonCard = {
  id: 'florizarretcg-001',          // unique dans tout le jeu
  name: 'Florizarre',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 160,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/florizarre-tcg.png'),
  attacks: [
    
    {
      name: 'Méga-Sangsue',
      damage: 80,
      energyCost: 4,
      requiredEnergies: { plante: 2 },
         effects: [
        {
          type: 'heal',
          amount: 30,
        },
    ],
    effectText:
    'Soignez 30 dégâts à ce pokémon.',

    },
  ],
};