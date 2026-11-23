import type { PokemonCard } from '@/features/game/types';

export const plumeline: PokemonCard = {
  id: 'plumeline-001',
  name: 'Plumeline',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/plumeline-card.png'),
  attacks: [
    
    
    {
      name: 'Danse Passionelle',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { feu: 1,},
effects: [
    { type: 'summonFromInvocationPool', amount: 2, poolSize: 4, pokemonType: 'feu', maxHp: 60 },
  ],
  effectText:
    "Invoquez 2 Pokémon Feu de Base ayant 60 PV ou moins sur votre banc . Les Invocations arrivent sans Énergie et ne peuvent pas être ciblés par les cartes Dresseur.",
      
    },
    {
      name: 'Enflammer',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { feu: 2,},
effects: [ { type: 'discardEnergy', amount: 1,  }, 
{    type: 'discardOpponentActiveEnergy',    amount: 1,  },
],
      effectText:  "Défaussez une Energie de ce Pokémon. Dans ce cas, défaussez une Énergie du Pokémon Actif de votre adversaire.",
    },
  ],
};