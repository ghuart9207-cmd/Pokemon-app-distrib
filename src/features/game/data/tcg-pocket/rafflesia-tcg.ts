import type { PokemonCard } from '@/features/game/types';

export const rafflesiaTCG: PokemonCard = {
  id: 'rafflesia-tcg-001',          // unique dans tout le jeu
  name: 'Rafflesia',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 140,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/rafflesia-tcg.png'),
  attacks: [
    {
      name: 'Senteur Apaisante',
      damage: 80,
        
      energyCost: 3,
      requiredEnergies: { plante: 2 }, 
        
    effects: [ { type: 'sleep',      amount: 1, },],
effectText: 'Le Pokémon actif de votre adversaire est maintenant Endormi.' 


      
},
],
}