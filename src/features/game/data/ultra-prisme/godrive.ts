import type { PokemonCard } from '@/features/game/types';

export const godrive: PokemonCard = {
  id: 'godrive-001',

  name: 'Godrive',

  stage: 'niveau1',

  variant: 'normal',

  type: 'psy',

  maxHp: 110,

  retreatCost: 1,

  artwork: require('../../../../../assets/images/godrive-card.png'),

  attacks: [
    {
      name: 'Transport de Dégats',

      damage: 0,

      energyCost: 2,
      

       effects: [
    {
      type: 'moveCountersFromOwnToOpponentActive',
      amount: 40,        
      pokemonCount: 2,   
    },
  ],
  effectText:
    "Déplacez 4 marqueurs de dégâts de 2 de vos Pokémon vers le Pokémon actif de votre adversaire.",
    },
     {
      name: 'Roue Eolienne',

      damage: 80,

      energyCost: 2,
      requiredEnergies: {
        psy: 1,
      },

      effects: [
        {
          type: 'forceOpponentActiveSwitch',

          amount: 1,
        },
      ],

      effectText:
        'Votre adversaire échange son Pokémon actif avec l’un de ses Pokémon de banc. (L’échange se fait horizontalement)',
    },
  ],
};