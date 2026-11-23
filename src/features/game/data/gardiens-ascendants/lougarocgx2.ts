import type { PokemonCard } from '@/features/game/types';

export const lougarocgx2: PokemonCard = {
  id: 'lougarocgx-002',
  name: 'Lougaroc GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'combat',
  maxHp: 200,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/lougarocgx2-card.png'),
  talent: {
  name: 'Regard Sanguinaire',
  type: 'passive',
  effect: 'script',
  description: 'Lorsque vous jouez ce Pokémon de votre main sur votre Banc pendant votre tour, vous pouvez échangez l’un des Pokémons de votre adversaire avec un autre.',
  script: [
    { action: 'whenPlayed', target: { who: 'self' },
  script: [
    { action: 'switch', target: { side: 'opponent', who: 'chosen' }, to: { filter: { position: 'bench' } }   ,optional: true,          },
  ],},
],
},
  attacks: [
    
    {
      name: 'Tranch’Griffe',
      damage: 110,
      energyCost: 3,
      requiredEnergies: { combat: 1,},
    },
  ],
};