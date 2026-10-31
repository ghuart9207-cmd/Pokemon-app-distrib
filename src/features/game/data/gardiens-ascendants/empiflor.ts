import type { PokemonCard } from '@/features/game/types';

export const empiflor: PokemonCard = {
  id: 'empiflor-001',
  name: 'Empiflor',
  stage: 'niveau2',
  variant: 'normal',
  type: 'plante',
  maxHp: 140,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/empiflor-card.png'),
  attacks: [
    
    {
      name: 'Pollen Dangeureux',
      damage: 20,
      energyCost: 1,

      requiredEnergies: {
        plante: 1,
      },

      effects: [ { type: 'poison',
      amount: 1, 
    },
    { type: 'confuse',
      amount: 1, 
    },
    { type: 'burn',
      amount: 1, 
    },
],


      effectText:
        'Le pokémon actif de votre adversaire est maintenant Confus, Empoisonné et Brulé.',
    },
    {
      name: 'Colle et Absorbe',
      damage: 80,
      energyCost: 3,

      requiredEnergies: {
        plante: 1,
      },

      effects: [
        {
          type: 'heal',
          amount: 20,
        },
        {      type: 'preventTargetRetreatNextTurn',      amount: 0,    },  
    ],
      effectText:
        'Soignez 20 dégats à ce Pokémon. Le pokémon défenseur ne peut pas battre en retraite pendant le prochain tour de votre adversaire.',
    },
  ],
};