import type { PokemonCard } from '@/features/game/types';

export const brocelome: PokemonCard = {
  id: 'brocelome-001',
  name: 'Brocélome',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 70,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/brocelome-card.png'),
  attacks: [
    
    {
      name: 'Charge',
      damage: 10,
      energyCost: 1,

      requiredEnergies: {
        plante: 1,
      },
    },
    {
      name: 'Onde Folie',
      damage: 0,
      energyCost: 2,

      effects: [ { type: 'confuse',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant confus.',
    },
  ],
};