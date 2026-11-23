import type { PokemonCard } from '@/features/game/types';

export const denticrisse: PokemonCard = {
  id: 'denticrisse-001',
  name: 'Denticrisse',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 100,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/denticrisse-card.png'),
  attacks: [
    {
      name: 'Grincedent',
      energyCost: 1,
      requiredEnergies: {
        eau: 1,
      },

      damage: 0,
      effects: [
        {
          type: 'confuse',
          amount: 1,
        },
      ],
      effectText: 'Le pokémon actif de votre adversaire est maintenant confus.',
    },

    {
      name: 'Synchropeine',

      damage: 60,

      energyCost: 3,
      requiredEnergies: {
        eau: 1,
      },

      benchDamageSameTypeAsTarget: 20,

      effectText:
        'Inflige 20 dégâts à chaque Pokémon de banc de votre adversaire ayant le même type que le Pokémon actif de votre adversaire.',
    },
  ],
};
