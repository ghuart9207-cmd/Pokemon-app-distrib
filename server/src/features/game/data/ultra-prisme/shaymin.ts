import type { PokemonCard } from '@/features/game/types';

export const shaymin: PokemonCard = {
  id: 'shaymin-001',
  name: 'Shaymin',
  stage: 'base',
  variant: 'normal',
  type: 'normal',
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/shaymin-card.png'),
  attacks: [
    
    
    {
      name: 'Appel à la Famille',
      damage: 0,
      energyCost: 1,
      

     effects: [    { type: 'summonFromInvocationPool', amount: 1,   maxHp: 60 },  ],
  effectText:    "Invoquez un Pokémon de Base ayant 60 PV ou moins sur votre banc. Comme ce sont des Invocations, ils arrivent sans Énergie et ne peuvent pas être ciblés par les cartes Dresseur.",


    },
    {
      name: 'Glissement',
      damage: 20,
      energyCost: 1,
      

     
    },
    
  ],
};