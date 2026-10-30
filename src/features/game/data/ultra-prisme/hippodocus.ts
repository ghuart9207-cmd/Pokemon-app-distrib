import type { PokemonCard } from '@/features/game/types';

export const hippodocus: PokemonCard = {
  id: 'hippodocus-001',
  name: 'Hippodocus',
  stage: 'niveau1',
  variant: 'normal',
  type: 'combat',
  maxHp: 140,
  retreatCost: 4,
  
  artwork: require('../../../../../assets/images/hippodocus-card.png'),
  attacks: [
    {
      name: 'Tourbi-Sable',
      damage: 50,
      energyCost: 3,
      requiredEnergies: { combat : 1
      },
      effects: [ {      type: 'preventTargetRetreatNextTurn',      amount: 0,    },  ],
effectText:    'Le Pokémon Défenseur ne peut pas battre en retraite pendant le prochain tour de votre adversaire.',

    },
    {
      name: 'Lames Royales',
      damage: 100,
      energyCost: 4,
      requiredEnergies: { combat : 2
      },
effects: [  {    type: 'bonusDamagePerTargetRetreatCost',    amount: 10,  },],
      effectText:
        'Cette attaque inflige 10 dégats supplémentaires pour chaque Energie dans le cout de retraite du Pokémon Actif de votre adversaire. ',
    },
  ],
};