import type { PokemonCard } from '@/features/game/types';

export const noadkokoextcg: PokemonCard = {
  id: 'noadkokoextcg-001',          // unique dans tout le jeu
  name: 'Noadkoko EX',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'ex',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 160,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/noadkokoex-tcg.png'),
  attacks: [
    {
      name: 'Coup Tropical',
      damage: 40,
        
      energyCost: 1,
      requiredEnergies: { plante: 1 }, 
        coinCount: 1,
 coinDamageEffects: [ {side: 'face',   condition: 'any',    damage: 40,  } ,  ],
effectText:  'Lancez une pièce. Si c’est Face, cette attaque inflige 40 dégâts supplémentaires.' 


      
},

],
};