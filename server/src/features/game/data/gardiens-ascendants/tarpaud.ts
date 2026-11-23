import type { PokemonCard } from '@/features/game/types';

export const tarpaud: PokemonCard = {
  id: 'tarpaud-001',
  name: 'Tarpaud',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 130,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tarpaud-card.png'),
  attacks: [
    
    {
      name: 'Hyper Saut',
      damage: 100,
      energyCost: 3,

        requiredEnergies: { eau: 1,  },
         effects: [
    { type: 'returnSelfToHand', amount: 0, returnToHandReplacement: 'normal' },
  ],
  effectText: 'Remettez ce Pokémon ainsi que les cartes Outils Pokémon lui étant attachées dans votre main, avec ses énergies.',
    },
      
    ],
};