import type { PokemonCard } from '@/features/game/types';

export const magearna: PokemonCard = {
  id: 'magearna-001',
  name: 'Magearna',
  stage: 'base',
  variant: 'normal',
  type: 'metal',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/magearna-card.png'),
  talent: {
  name: 'Changement de Tenue',
  type: 'activated',
  effect: 'returnToolToHandOncePerTurn',
  description:
    "Une seule fois pendant votre tour, vous pouvez placer dans votre main une carte Outil attachée à l'un de vos Pokémon.",
},
  attacks: [
    {
      name: 'Attaque qui roule',
      damage: 60,
      energyCost: 3,
  requiredEnergies: { metal: 1,  },
      
    },
    
  ],
};