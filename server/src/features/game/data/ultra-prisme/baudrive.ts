import type { PokemonCard } from '@/features/game/types';

export const baudrive: PokemonCard = {
  id: 'baudrive-001',
  name: 'Baudrive',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/baudrive-card.png'),
  attacks: [
    
    
    {
      name: 'Vent Perturbant',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { psy: 1,},

      effects: [ { type: 'confuse',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant Confus.',
    },
    {
      name: 'Suspension',
      damage: 10,
      energyCost: 1,
    },
  ],
};