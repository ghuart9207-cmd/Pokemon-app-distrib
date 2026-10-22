import type { PokemonCard } from '@/features/game/types';

export const nounourson: PokemonCard = {
  id: 'nounourson-001',          // unique dans tout le jeu
  name: 'Nounourson',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'normal',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/nounourson-card.png'),
  attacks: [
    { name: 'Regard Touchant', damage: 0, energyCost: 1, 
    effects: [
    {
      type: 'preventTargetRetreatNextTurn',
      amount: 0,
    },
  ],

  effectText:
    'Le Pokémon Défenseur ne peut pas battre en retraite pendant le prochain tour de votre adversaire.',
},
    {
      name: 'Charge',
      damage: 20,
      energyCost: 2,
      
    },
  ],
};