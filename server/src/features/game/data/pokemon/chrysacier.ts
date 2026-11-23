import type { PokemonCard } from '@/features/game/types';

export const chrysacier: PokemonCard = {
  id: 'chrysacier-001',          // unique dans tout le jeu
  name: 'Chrysacier',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/chrysacier-card.png'),
  attacks: [
    { name: 'Collision', damage: 20, energyCost: 1, requiredEnergies: { plante: 1 },},
    {
      name: 'Mue',
      damage: 0,
      energyCost: 2,
         effects: [
        {
          type: 'heal',
          amount: 40,
        },
    ],
    effectText:
    'Soignez 40 dégâts à ce pokémon.',

    },
  ],
};