import type { PokemonCard } from '@/features/game/types';

export const mamanbo: PokemonCard = {
  id: 'mamanbo-001',
  name: 'Mamanbo',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 110,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/mamanbo-card.png'),
  attacks: [
    {
  name: 'Ramené au Rivage',
  damage: 0,
  energyCost: 1,
  effects: [{ type: 'summonFromAnyDiscard', amount: 1, maxHp: 80 }],
  effectText:
    "Invoquez un Pokémon de Base 80 PV ou moins de votre pile de défausse sur votre banc, ou de la pile de défausse de votre adversaire sur son banc.",
},
    {
      name: 'Hydro-Eclaboussure',
      damage: 60, 
      energyCost: 3,

      requiredEnergies: {
        eau: 1,
      },
      
    },
      
    ],
};