import type { PokemonCard } from '@/features/game/types';

export const scarhino: PokemonCard = {
  id: 'scarhino-001',

  name: 'Scarhino',

  stage: 'base',

  variant: 'normal',

  type: 'plante',

  maxHp: 110,

  retreatCost: 2,

  artwork: require('../../../../../assets/images/scarhino-card.png'),

  talent: {
    name: 'Cran',

    type: 'passive',

    effect: 'surviveKOOnCoin',

    description:
      'Si ce Pokémon doit être mis K.O., lancez une pièce. Si c’est Face, ce Pokémon n’est pas mis K.O. et il lui reste 10 PV.',
  },

  attacks: [
    {
      name: 'Lancer',

      damage: 50,

      energyCost: 2,
      requiredEnergies: {
        plante: 2,
      },

      effects: [
        {
          type: 'forceOpponentActiveSwitch',

          amount: 1,
        },
      ],

      effectText:
        'Votre adversaire échange son Pokémon actif avec l’un de ses Pokémon de banc.',
    },
  ],
};
