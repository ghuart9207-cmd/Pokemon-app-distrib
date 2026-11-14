import type { PokemonCard } from '@/features/game/types';

export const necrozmaauroregx: PokemonCard = {
  id: 'necrozmaauroregx-001',
  name: 'Necrozma Aurore GX',
  stage: 'base',
  variant: 'gx',
  type: 'psy',
  maxHp: 180,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/necrozmaauroregx-card.png'),
  talent: {
  name: 'Invasion',
  type: 'activated',
  effect: 'switchWithBenchOncePerTurn',
  description:
    "Une seule fois pendant votre tour, vous pouvez échanger ce Pokémon contre l'un de vos Pokémon de banc.",
},
  attacks: [
    
    {
      name: 'Flash Sombre',
      damage: 120,
      energyCost: 3,

      requiredEnergies: {
        psy: 3,
      },
effects: [
  {
    type: 'ignoreTargetDamageReduction',
    amount: 0,
  },
],
effectText:
  "Les dégâts de cette attaque ne sont pas affecté par la résistance.",
      
    },
  ],
};