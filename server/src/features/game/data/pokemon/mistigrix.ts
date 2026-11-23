import type { PokemonCard } from '@/features/game/types';

export const mistigrix: PokemonCard = {
  id: 'mistigrix-001',          // unique dans tout le jeu
  name: 'Mistigrix',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/mistigrix-card.png'),
  attacks: [
    
    {
      name: 'Télékinésie en Main',
      damage: 0,
      energyCost: 2,
      
      
       effects: [{ type: 'damagePerOwnCardInHand', amount: 10 }],
  effectText: 'Cette attaque inflige 10 dégâts pour chaque carte dans votre main.',
    },
  ],
};