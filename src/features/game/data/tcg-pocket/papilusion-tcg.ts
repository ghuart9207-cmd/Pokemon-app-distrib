import type { PokemonCard } from '@/features/game/types';

export const papilusiontcg: PokemonCard = {
  id: 'papilusiontcg-001',
  name: 'Papilusion',
  stage: 'niveau2',
  variant: 'normal',
  type: 'plante',
  maxHp: 120,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/papilusion-tcg.png'),
  talent: {
  name: 'Soin Poudre',
  type: 'activated',
  effect: 'healAllOwnPokemonOncePerTurn',
  amount: 20, 
  description: 'Une seule fois pendant votre tour, vous pouvez soigner 20 dégâts à chacun de vos Pokémon.',
},
  attacks: [
    {
      name: 'Tornade',
      damage: 60,
      energyCost: 3,
      
      requiredEnergies: {
        plante: 1,
      },

    },
  ],
};