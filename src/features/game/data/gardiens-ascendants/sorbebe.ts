import type { PokemonCard } from '@/features/game/types';

export const sorbebe: PokemonCard = {
  id: 'sorbebe-001',
  name: 'Sorbébé',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 50,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/sorbebe-card.png'),
  attacks: [
    
    {
      name: 'Triple Tour',
      damage: 0, coinCount: 3, damagePerFace: 10,
      energyCost: 1,

      requiredEnergies: {
        eau: 1,
      },
      effectText:  "Lancez 3 pièces. Cette attaque inflige 10 dégats multipliés par le nombre de cotés face.",
    },
      
    ],
};