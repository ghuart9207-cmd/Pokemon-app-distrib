import type { PokemonCard } from '@/features/game/types';

export const sarmurai: PokemonCard = {
  id: 'sarmuraï-001',
  name: 'Sarmuraï GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'plante',
  maxHp: 210,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/sarmurai-card.png'),
  attacks: [
    {
      name: 'Escarmouche',

      damage: 30,

      energyCost: 1,
      requiredEnergies: {
        plante: 1,
      },

      bonusDamageIfSwitchedRecently: 90,

      effectText:
        'Si ce Pokémon a échangé de place pendant ce tour ou pendant le dernier tour de votre adversaire, cette attaque inflige 90 dégâts supplémentaires.',
    },

    {
      name: 'Pression Cuirassée',
      damage: 100,
      energyCost: 3,

      requiredEnergies: {
        plante: 1,
      },

      effects: [
        {
          type: 'reduceDamageNextOpponentTurn',
          amount: 20,
        },
      ],
      effectText:
        'Pendant le prochain tour de votre adversaire, ce pokémon subit 20 dégats de moins provenant des attaques.',
    },
  ],
};
