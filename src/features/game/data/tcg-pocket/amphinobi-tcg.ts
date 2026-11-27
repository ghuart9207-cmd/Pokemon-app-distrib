import type { PokemonCard } from '@/features/game/types';

export const amphinobitcg: PokemonCard = {
  id: 'amphinobitcg-001',
  name: 'Amphinobi',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 120,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/amphinobi-tcg.png'),
  talent: {
  name: 'Sheauriken',
  type: 'activated',
  effect: 'script', description: 'Une fois pendant votre tour, vous pouvez infliger 20 dégats à un Pokémon de votre adversaire.', script: [
  { action: 'damage',amount: 20, target: { side: 'opponent' ,who: 'chosen', includePlayer: true },
     },
  ],
},
  attacks: [
   {
      name: 'Tranche-Brume',
      damage: 60,
      energyCost: 2,
      requiredEnergies: {
        eau: 1,
      },

    },
    
  ],
};