import type { PokemonCard } from '@/features/game/types';

export const sinistrail: PokemonCard = {
  id: 'sinistrail-001',
  name: 'Sinistrail',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 120,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sinistrail-card.png'),
  talent: {
  name: 'Expert Acier',
  effect: 'script',
  type: 'passive',
  script: [ { action: 'boost',amount: 10, target: { side: 'own', who: 'all' , filter: { pokemonTypes: ['metal'] }, }, } ],
  
  description:
    "Les attaques de vos Pokémon de type Métal infligent 10 dégâts supplémentaires au Pokémon Actif de votre adversaire.",
},
  attacks: [
    
    {
      name: 'Ancrage',
      damage: 70,
      energyCost: 3,

      requiredEnergies: {
        psy: 1,
      },

    effects: [ {      type: 'preventTargetRetreatNextTurn',      amount: 0,    },  ],
effectText:    'Le Pokémon Défenseur ne peut pas battre en retraite pendant le prochain tour de votre adversaire.',

    },
      
    ],
};