import type { PokemonCard } from '@/features/game/types';

export const raichutcg: PokemonCard = {
  id: 'raichutcg-001',
  name: 'Raichu',
  stage: 'niveau1',
  variant: 'normal',
  type: 'electrique',
  maxHp: 100,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/raichu-tcg.png'),
  
  attacks: [
   {
      name: 'Tonnerre',
      damage: 140,
      energyCost: 3,
      requiredEnergies: {
        electrique: 3,
      },
effects: [ { type: 'discardEnergy', amount: 99,  }, ],
effectText:        'Défaussez toute l’Energie de ce Pokémon.',
    },
  ],
};