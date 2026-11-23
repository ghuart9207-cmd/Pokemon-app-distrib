import type { PokemonCard } from '@/features/game/types';

export const bourrinos2: PokemonCard = {
  id: 'bourrinos-002',

  name: 'Bourrinos',

  stage: 'niveau1',

  variant: 'normal',

  type: 'combat',

  maxHp: 140,

  retreatCost: 4,

  artwork: require('../../../../../assets/images/bourrinos2-card.png'),

 
  attacks: [
    {
      name: 'Piétinement Amélioré',

      damage: 60,

      energyCost: 3,
      requiredEnergies: {
        combat: 2,
      },

      effects: [
  {
    type: 'bonusDamageIfToolAttached',
    amount: 60,
  },
],
effectText:
  "Si une carte Outil est attachée à ce Pokémon, cette attaque inflige 60 dégâts supplémentaires.",
    },
    {
      name: 'Cavalerie Lourde',

      damage: 180,

      energyCost: 4,
      requiredEnergies: {
        combat: 3,
      },

      effects: [
  {
    type: 'recoil',
    amount: 40,
  },
],

      effectText:
        'Ce pokémon s’inflige 40 dégats.',
    },
  ],
};