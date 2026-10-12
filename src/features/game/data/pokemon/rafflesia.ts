import type { PokemonCard } from '@/features/game/types';

export const rafflesia: PokemonCard = {
  id: 'rafflesia-001',
  name: 'Rafflesia',
  stage: 'niveau2',
  variant: 'normal',
  type: 'plante',
  maxHp: 140,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/rafflesia-card.png'),

  talent: {
    name: 'Pollen Dégoutant',
    type: 'passive',
    effect: 'blockBaseAttacks',
    description:
      'Tant que ce Pokémon est actif, les Pokémon de Base ne peuvent pas attaquer.',
  },

  attacks: [
    {
      name: 'Choc Immobilisateur',
      damage: 60,
      energyCost: 3,
      requiredEnergies: {
        plante: 2,
      },

      coinCount: 1,

      coinEffects: [
        {
          side: 'pile',
          effect: {
            type: 'paralyze',
            amount: 1,
          },
        },

        {
          side: 'face',
          effect: {
            type: 'confuse',
            amount: 1,
          },
        },
      ],
      effectText:
        'Lancez une pièce. Si c’est PILE, le Pokémon adverse est Paralysé. Si c’est FACE, il est Confus.',
    },
  ],
};
