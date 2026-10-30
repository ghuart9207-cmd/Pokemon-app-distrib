import type { PokemonCard } from '@/features/game/types';

export const magnezone: PokemonCard = {
  id: 'magnezone-001',          // unique dans tout le jeu
  name: 'Magnézone',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'metal',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 150,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/magnezone-card.png'),
  talent: {
  name: 'Circuit Magnétique',
  type: 'activated',
  effect: 'attachEnergyOncePerTurn',
  energyType: 'metal',
  targetPokemonType: 'metal',
  amount: 1,
  description:
    'Une fois pendant votre tour, attachez une Énergie Fée à l’un de vos Pokémon Métal.',
},
  attacks: [
    
    {
      name: 'Elecanon',
      damage: 130,
      energyCost: 4,
      requiredEnergies: { metal: 3 }, 
      
    blocksNextOwnTurn: true,
  
   
    
  

  effectText:
    'Ce Pokémon ne peut pas utiliser Elecanon pendant votre prochain tour.',
    },
  ],
};