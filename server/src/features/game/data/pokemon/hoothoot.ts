import type { PokemonCard } from '@/features/game/types';

export const hoothoot: PokemonCard = {
  id: 'hoothoot-001',          // unique dans tout le jeu
  name: 'Hoothoot',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'normal',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/hoothoot-card.png'),
  attacks: [
    {
      name: 'Picpic',
      damage: 20,
       
      energyCost: 2,
  
},
],
};