import type { PokemonCard } from '@/features/game/types';

export const tokopiscoGx: PokemonCard = {
  id: 'tokopiscogx-001',
  name: 'Tokopisco Gx',
  stage: 'base',
  variant: 'gx',
  type: 'eau',
  maxHp: 170,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tokopisco-card.png'),
  attacks: [
    {
      name: 'Anneau Hydro',
      damage: 20,
      energyCost: 1,
    
      effects: [
        {
          type: 'switchWithBench',
          amount: 1,
        },
      ],

      effectText:
        'Échangez ce Pokémon avec l’un de vos Pokémon de banc situé sur la même ligne.(L’échange se fait horizontalement)',
    },
    {
      name: 'Hydro-Coup',
      damage: 120,
      energyCost: 3,
requiredEnergies: { eau: 2,
      },
      effects: [
        {
          type: 'discardTypedEnergy',
          amount: 2,
          energyType: 'eau',
        },
      ],

      targetMode: 'anyOpponentPokemon',

      effectText:
        'Défaussez 2 Énergies Eau attachées à ce Pokémon. Choisissez 1 Pokémon adverse et infligez-lui 120 dégâts.',
    },
  ],
};
