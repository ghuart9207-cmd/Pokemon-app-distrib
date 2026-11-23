import type { PokemonCard } from '@/features/game/types';

export const bourrinos: PokemonCard = {
  id: 'bourrinos-001',

  name: 'Bourrinos',

  stage: 'niveau1',

  variant: 'normal',

  type: 'combat',

  maxHp: 130,

  retreatCost: 3,

  artwork: require('../../../../../assets/images/bourrinos-card.png'),

 
  attacks: [
    {
      name: 'Coud’Pied Ejecteur',

      damage: 60,

      energyCost: 3,
      

      effects: [
        {
          type: 'forceOpponentActiveSwitch',

          amount: 1,
        },
      ],

      effectText:
        'Votre adversaire échange son Pokémon actif avec l’un de ses Pokémon de banc.',
    },
    {
      name: 'Ruée Vigoureuse',

      damage: 130,
secondaryBenchOrPlayerDamage: 30,
      energyCost: 4,
      requiredEnergies: {
        combat: 1,
      },

      effects: [
  {
    type: 'recoil',
    amount: 30,
  },
],

      effectText:
        'Ce pokémon s’inflige 30 dégats. Cette attaque inflige 30 dégats à l’un des Pokémon de Banc de votre adversaire.',
    },
  ],
};