import type { PokemonCard } from '@/features/game/types';

export const metalossegx: PokemonCard = {
  id: 'metalossegx-001',
  name: 'Métalosse GX',
  stage: 'niveau2',
  variant: 'gx',
  type: 'metal',
  maxHp: 250,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/metalossegx-card.png'),
  talent: {
  name: 'Système Géotechnique',
  type: 'activated',
  effect: 'script',
  description: 'Une seule fois pendant votre tour, vous pouvez attacher une carte Energie psy ou metal de votre pile de défausse à l\'un de vos Pokémon psy ou metal.',
  script: [
     { action: 'attachEnergy', fromDiscard: true, amount: 1, energyTypes: ['metal' ,'psy'],
    target: { side: 'own', who: 'chosen', count: 1, filter: { pokemonTypes: ['metal', 'psy'],  } } },

],
},
  attacks: [
    
    {
      name: 'Giga Marteau',
      damage: 150,
      energyCost: 3,
      requiredEnergies: { metal: 1,},
       blocksNextOwnTurn: true,
      effectText:
        'Ce Pokémon ne peut pas utiliser Giga Marteau pendant votre prochain tour.',
    },
  ],
};