import type { PokemonCard } from '@/features/game/types';

export const necrozmaGx: PokemonCard = {
  id: 'necrozma-gx-001',
  name: 'Necrozma GX',
  stage: 'base',
  variant: 'gx',
  type: 'psy',
  maxHp: 180,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/necrozma-card.png'),

  talent: {
    name: 'Extinction des Feux',
    type: 'passive',

    effect: 'preventDamageFromType',

    blockedType: 'normal',

    description:
      'Évite tous les dégâts infligés à ce Pokémon par les attaques des Pokémon de type Normal.',
  },

  attacks: [
    {
      name: 'Explosion Prismatique',

      damage: 10,

      energyCost: 3,

      effects: [
        {
          type: 'discardAllTypedEnergyForBonus',

          energyType: 'psy',

          // +60 dégâts par Énergie
          amount: 60,
        },
      ],

      effectText:
        'Défaussez toutes les Énergies Psy attachées à ce Pokémon. Cette attaque inflige 60 dégâts supplémentaires pour chaque Énergie défaussée de cette façon.',
    },
  ],
};
