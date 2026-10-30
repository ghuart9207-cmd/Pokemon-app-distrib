import type { PokemonCard } from '@/features/game/types';

export const lampignon2: PokemonCard = {
  id: 'lampignon-002',          // unique dans tout le jeu
  name: 'Lampignon',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 100,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/lampignon2-card.png'),
  talent: {
  name: 'Nom du talent',
  type: 'activated',
  effect: 'summonOncePerTurn',
  targetPokemonType: 'fee',  
  maxHp: 60,                
  amount: 1,                  
  description:
    'Une seule fois pendant votre tour, vous pouvez invoquer un Pokémon Fée de Base ayant 60 PV ou moins sur votre banc.',
},
  attacks: [
    {
      name: 'Spores Scintilantes',
      damage: 30,
      energyCost: 2,
      

      effects: [ { type: 'sleep',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant endormi.',
    },
    
    
  ],
};