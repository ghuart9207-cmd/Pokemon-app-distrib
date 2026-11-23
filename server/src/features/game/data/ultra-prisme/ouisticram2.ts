import type { PokemonCard } from '@/features/game/types';

export const ouisticram2: PokemonCard = {
  id: 'ouisticram-002',
  name: 'Ouisticram',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/ouisticram2-card.png'),
  attacks: [
    
    
    {
      name: 'Combot-Griffe',
      damage: 0,
      energyCost: 1,
    coinCount: 3, damagePerFace: 10,
 effectText:
        'Lancez 4 pièces. Cette attaque inflige 10 dégâts pour chaque côté Face.',
    },
  ],
};