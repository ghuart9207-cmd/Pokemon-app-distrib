import type { PokemonCard } from '@/features/game/types';

export const fragiladytcg: PokemonCard = {
  id: 'fragilady-001',
  name: 'Fragilady',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 100,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/fragilady-tcg.png'),
  attacks: [
   
    {
      name: 'Provision de Feuillage',
      damage: 50,
      energyCost: 2,
      requiredEnergies: {
        plante: 2,
      },

      effects: [
        {
          type: 'attachEnergyToBench',

          amount: 1,

          energyType: 'plante',
           targetPokemonType: 'plante',
        },
      ],

      effectText: 'Attachez une Énergie Plante de votre main à l’un de vos Pokémon de banc.',
    },
  ],
};