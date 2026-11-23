import type { PokemonCard } from '@/features/game/types';

export const heatran: PokemonCard = {
  id: 'heatran-001',
  name: 'Heatran',
  stage: 'base',
  variant: 'normal',
  type: 'metal',
  maxHp: 130,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/heatran-card.png'),
  attacks: [
    {
      name: 'Pression de Garde',
      damage: 30,
      energyCost: 2,
  requiredEnergies: { metal: 1,  },
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
      name: 'Impact Bouillant',
      damage: 130,
      energyCost: 3,
      requiredEnergies: { metal: 1,  },
      effects: [ { type: 'discardEnergy', amount: 2,  }, ],
       effectText:
        'Défaussez 2 Energies de ce Pokémon.',
    },
  ],
};