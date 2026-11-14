import type { PokemonCard } from '@/features/game/types';

export const cadoizo: PokemonCard = {
  id: 'cadoizo-001',
  name: 'Cadoizo',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/cadoizo-card.png'),
  attacks: [
    {
      name: 'Attaque Surprise',
      damage: 40,
      energyCost: 1,
      coinCount: 1,
      requiredEnergies: {
        eau: 1,
      },

      failsOn: 'pile',

      effectText: 'Lancez une pièce. Si c’est Pile, cette attaque ne fait rien.',
    },
  ],
};