import type { PokemonCard } from '@/features/game/types';

export const ectoplasmaextcg: PokemonCard = {
  id: 'ectoplasmaextcg-001',
  name: 'Ectoplasma EX',
  stage: 'niveau2',
  variant: 'ex',
  type: 'psy',
  maxHp: 170,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/ectoplasmaex-tcg.png'),
  talent: {
  name: 'Maléfice des Ombres',
  type: 'passive',
  effect: 'script', description: 'Votre adversaire ne peut pas utiliser de cartes Supporter.', script: [
  {
      action: 'prevent', prevent: ['supporters'], target: { side: 'opponent', who: 'player' }, duration: 'opponentNextTurn', },
  ],
},
  attacks: [
   {
      name: 'Tir Effrayant',
      damage: 100,
      energyCost: 3,
      requiredEnergies: {
        psy: 3,
      },
      
    },
    
  ],
};