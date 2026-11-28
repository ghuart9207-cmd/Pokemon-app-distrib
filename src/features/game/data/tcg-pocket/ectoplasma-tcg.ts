import type { PokemonCard } from '@/features/game/types';

export const ectoplasmatcg: PokemonCard = {
  id: 'ectoplasmatcg-001',
  name: 'Ectoplasma',
  stage: 'niveau2',
  variant: 'normal',
  type: 'psy',
  maxHp: 130,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/ectoplasma-tcg.png'),
  
  attacks: [
   {
      name: 'Supplice',
      damage: 50,
      energyCost: 1,
      requiredEnergies: {
        psy: 1,
      },
      script: [{
      action: 'prevent', prevent: ['supporters'], target: { side: 'opponent', who: 'player' }, duration: 'opponentNextTurn', },
    ],
  effectText:
    "Votre adversaire ne peut pas utiliser de cartes Supporter pendant son prochain tour.",
    },
    
  ],
};