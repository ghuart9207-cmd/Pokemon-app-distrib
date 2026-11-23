import type { PokemonCard } from '@/features/game/types';

export const funecire: PokemonCard = {
  id: 'funecire-001',
  name: 'Funécire',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 50,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/funecire-card.png'),
  attacks: [
    
    
    {
      name: 'Flammes Vacillantes',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { feu: 1,},

      effects: [ { type: 'sleep',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant endormi.',
    },
  ],
};