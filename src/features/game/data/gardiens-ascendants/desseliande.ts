import type { PokemonCard } from '@/features/game/types';

export const desseliande: PokemonCard = {
  id: 'desseliande-001',          // unique dans tout le jeu
  name: 'Desséliande',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 120,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/desseliande-card.png'),
  attacks: [
    {
      name: 'Poltergeist',
      damage: 0,
      energyCost: 2,
        requiredEnergies: { plante: 2},
      
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