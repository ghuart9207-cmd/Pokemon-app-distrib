import type { PokemonCard } from '@/features/game/types';

export const chenipan: PokemonCard = {
  id: 'chenipan-001',
  name: 'chenipan',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 50,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/chenipan-card.png'),
  attacks: [
    {
      name: 'Attaque Surprise',
      damage: 20,
      energyCost: 1,
      coinCount: 1,
      requiredEnergies: {
        plante: 1,
      },

      failsOn: 'pile',

      effectText: 'Lancez une pièce. Si c’est Pile, cette attaque ne fait rien.',
    },
  ],
};
