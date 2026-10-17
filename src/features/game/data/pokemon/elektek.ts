import type { PokemonCard } from '@/features/game/types';

export const elektek: PokemonCard = {
  id: 'elektek-001',
  name: 'Elektek',
  stage: 'base',
  variant: 'normal',
  type: 'electrique',
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/elektek-card.png'),
  attacks: [
    {
      name: 'Koud’Poing',
      damage: 20,
      energyCost: 1,
    },
    {
      name: 'Ecalir',
      damage: 40,
      energyCost: 2,

      requiredEnergies: {
        electrique: 1,
      },

      coinCount: 1,

      coinEffects: [ { side: 'face',
    effect: {type: 'paralyze',
        amount: 1,  }, },],
effectText: 'Lancez une pièce. Si c’est Face, le Pokémon adverse est Paralysé.'

    },
  ],
};