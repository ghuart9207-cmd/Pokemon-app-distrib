import type { PokemonCard } from '@/features/game/types';

export const coconforttcg: PokemonCard = {
  id: 'coconforttcg-001',          // unique dans tout le jeu
  name: 'Coconfort',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/coconfort-tcg.png'),
  attacks: [
    {
      name: 'Sécrétion',
      damage: 20,
        
      energyCost: 1,
      requiredEnergies: { plante: 1 }, 
        coinCount: 1,
 
coinEffects: [ { side: 'face',
    effect: {type: 'paralyze',
        amount: 1,  }, },],
effectText: 'Lancez une pièce. Si c’est Face, le Pokémon adverse est Paralysé.' 


      
},
],
}