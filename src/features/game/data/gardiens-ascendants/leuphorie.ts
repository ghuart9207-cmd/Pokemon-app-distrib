import type { PokemonCard } from '@/features/game/types';

export const leuphorie: PokemonCard = {
  id: 'leuphorie-001',
  name: 'Leuphorie',
  stage: 'niveau1',
  variant: 'normal',
  type: 'normal',
  maxHp: 160,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/leuphorie-card.png'),
  talent: {
  name: 'Oeuf Frais',
  type: 'passive',
  effect: 'script',
  description: 'Lorsque vous jouez ce Pokémon de votre main sur votre Banc pendant votre tour, vous pouvez soignez 80 dégâts de l\'un de vos Pokémon.',
  script: [
    { action: 'whenPlayed', target: { who: 'self' },
  script: [
    { action: 'heal',amount: 80, target: { side: 'own', who: 'chosen' },    optional: true,          },
  ],},
],
},
  attacks: [
    
    {
      name: 'Damoclès',
      damage: 160,
      energyCost: 4,
      effects: [
  {
    type: 'recoil',
    amount: 80,
  },
],
effectText:
    'Ce Pokémon s’inflige 80 dégâts.',
    },
  ],
};