import type { PokemonCard } from '@/features/game/types';

export const spododo2: PokemonCard = {
  id: 'spododo-002',          // unique dans tout le jeu
  name: 'Spododo',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/spododo2-card.png'),
  attacks: [
    {
      name: 'Spores Scintilantes',
      damage: 0,
      energyCost: 1,
      

      effects: [ { type: 'sleep',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant endormi.',
    },
    { name: 'Collision', damage: 10, energyCost: 1},
    
  ],
};