import type { PokemonCard } from '@/features/game/types';

export const florizarreextcg: PokemonCard = {
  id: 'florizarreextcg-001',          // unique dans tout le jeu
  name: 'Florizarre EX',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'ex',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 190,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/florizarreex-tcg.png'),
  attacks: [
    {
      name: 'Tranche’Herbe',
      damage: 60,
        
      energyCost: 3,
      requiredEnergies: { plante: 1 }, 
        

      
},
{
      name: 'Pousse Géante',
      damage: 100,
        
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