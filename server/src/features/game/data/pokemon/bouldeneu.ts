import type { PokemonCard } from '@/features/game/types';

export const bouldeneu: PokemonCard = {
  id: 'bouldeneu-001',
  name: 'Bouldeneu',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 140,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/bouldeneu-card.png'),
  attacks: [
    {
      name: 'Giga-Sangsue',

      damage: 30,

      energyCost: 1,
      requiredEnergies: {
        plante: 1,
      },

      effects: [
        {
          type: 'healSelfByDamageDealt',
          amount: 0,
        },
      ],

      effectText:
        'Soignez à ce Pokémon la même quantité de dégâts que cette attaque a infligée au Pokémon actif de votre adversaire.',
    },

    {
      name: 'Fouets Croisés',

      damage: 0,

      energyCost: 4,

      coinCount: 4,

      damagePerFace: 50,

      effectText:
        'Lancez 4 pièces. Cette attaque inflige 50 dégâts pour chaque côté Face.',
    },
  ],
};
