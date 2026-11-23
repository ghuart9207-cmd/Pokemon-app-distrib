import type { PokemonCard } from '@/features/game/types';

export const frison: PokemonCard = {
  id: 'frison-001',
  name: 'Frison',
  stage: 'base',
  variant: 'normal',
  type: 'normal',
  maxHp: 120,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/frison-card.png'),
  attacks: [
    {
      name: 'Tete Frisée',
      damage: 30,
      energyCost: 2,

      effects: [
        {
          type: 'reduceDamageNextOpponentTurn',
          amount: 30,
        },
      ],

      effectText:
        'Pendant le prochain tour de votre adversaire, ce Pokémon subit 30 dégâts de moins provenant des attaques.',
    },
    {
      name: 'Culbute',
      damage: 80,
      energyCost: 3,
    },
  ],
};
