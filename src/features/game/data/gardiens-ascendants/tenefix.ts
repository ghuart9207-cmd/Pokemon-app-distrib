import type { PokemonCard } from '@/features/game/types';

export const tenefix: PokemonCard = {
  id: 'tenefix-001',
  name: 'Tenefix',
  stage: 'base',
  variant: 'normal',
  type: 'obscurite',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tenefix-card.png'),
  attacks: [
    
    {
      name: 'Restriction',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { obscurite: 1},
script: [{
      action: 'prevent', prevent: ['supporters'], target: { side: 'opponent', who: 'player' }, duration: 'opponentNextTurn', },
    ],
  effectText:
    "Votre adversaire ne peut pas utiliser de cartes Supporter pendant son prochain tour.",
    },
    {
      name: 'Griffe',
      damage: 20,
      energyCost: 1,

     
    },
      
    ],
};