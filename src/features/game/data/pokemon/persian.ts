import type { PokemonCard } from '@/features/game/types';

export const persian: PokemonCard = {
  id: 'persian-001',
  name: 'Persian',
  stage: 'niveau1',
  variant: 'normal',
  type: 'normal',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/persian-card.png'),
  attacks: [
    {
      name: 'Grincement',

      damage: 0,

      energyCost: 1,

      effects: [
        {
          type: 'takeExtraDamageNextTurn',
          amount: 60,
        },
      ],

      effectText:
        'Pendant votre prochain tour, le Pokémon Défenseur subit 60 dégâts supplémentaires des attaques.',
    },
    {
      name: 'Tranche',

      damage: 40,

      energyCost: 1,
    },
  ],
};
