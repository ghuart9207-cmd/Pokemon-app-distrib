import type { PokemonCard } from '@/features/game/types';

export const victini: PokemonCard = {
  id: 'victini-001',
  name: 'Victini',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/victini-card.png'),
  talent: {
  name: 'Victorieux',
  type: 'passive',
  effect: 'invertImposedAttackCoinFlipOncePerTurn',
  description:
    "Une seule fois pendant votre tour, après avoir lancé des pièces qui étaient imposés pour une attaque, vous pouvez ignorer ce lancer et lancer à nouveau. Vous ne pouvez pas utiliser plus d'un talent Victorieux par tour.",
},
  attacks: [
    
    {
      name: 'V-Flamme',
      damage: 50,
      energyCost: 2,

      requiredEnergies: {
        feu: 1,
      },
    },
      
    ],
};