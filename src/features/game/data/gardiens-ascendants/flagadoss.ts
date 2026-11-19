import type { PokemonCard } from '@/features/game/types';

export const flagadoss: PokemonCard = {
  id: 'flagadoss-001',          // unique dans tout le jeu
  name: 'Flagadoss',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/flagadoss-card.png'),
  attacks: [
    {
      name: 'Poltergeist',
      damage: 0,
      energyCost: 2,
        requiredEnergies: { psy: 2},
      
         effects: [{ type: 'damagePerOpponentTrainerInHand', amount: 30 }],
  effectText: 'Cette attaque inflige 30 dégâts pour chaque carte Dresseur dans la main de votre adversaire.',

    },
    {
      name: 'Encornebois',
      damage: 90,
      energyCost: 3,
      
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