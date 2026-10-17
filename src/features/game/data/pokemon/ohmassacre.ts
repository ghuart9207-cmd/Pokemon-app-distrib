import type { PokemonCard } from '@/features/game/types';

export const ohmassacre: PokemonCard = {
  id: 'ohmassacre-001',          // unique dans tout le jeu
  name: 'Ohmassacre',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'electrique',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 140,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/ohmassacre-card.png'),
  attacks: [
    {
      name: 'Pince des Ténèbres',
      damage: 50,
      energyCost: 2,
      requiredEnergies: { electrique: 1 }, 
       
},
{
      name: 'Eclair Aspiré',
      damage: 80,
      energyCost: 3,
      requiredEnergies: { electrique: 2 }, 
       
},
],
};