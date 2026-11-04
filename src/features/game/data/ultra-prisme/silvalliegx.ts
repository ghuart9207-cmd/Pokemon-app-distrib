import type { PokemonCard } from '@/features/game/types';

export const silvalliegx: PokemonCard = {
  id: 'silvallie-001',
  name: 'Silvallié GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'normal',
  maxHp: 210,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/silvalliegx-card.png'),
  talent: {
  name: 'Nom du talent',
  type: 'passive',
  effect: 'freeRetreatForOwnBasePokemon',
  description: "Vos Pokémon de Base en jeu n'ont pas de coût de retraite.",
},
  attacks: [
    
    {
      name: 'Propulsion Turbo',
      damage: 120,
      energyCost: 3,
      effects: [    {      type: 'recoverEnergyToBench',      amount: 1,          },  ], 
effectText:'Attachez 1 Énergie de votre pile de défausse à l’un de vos Pokémon debanc.',


      
      

      

  
    },
  ],
};