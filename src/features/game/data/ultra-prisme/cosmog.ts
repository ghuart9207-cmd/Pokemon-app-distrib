import type { PokemonCard } from '@/features/game/types';

export const cosmog: PokemonCard = {
  id: 'cosmog-001',
  name: 'Cosmog',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/cosmog-card.png'),
  attacks: [
    
    
    {
      name: 'Téléport',
      damage: 0,
      energyCost: 1,
      

      effects: [
        {
          type: 'switchWithBench',
          amount: 1,
        },
      ],

      effectText:
        'Échangez ce Pokémon avec l’un de vos Pokémon de banc situé sur la même ligne.(L’échange se fait horizontalement)',
    },
    
  ],
};