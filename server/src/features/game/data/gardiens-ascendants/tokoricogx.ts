import type { PokemonCard } from '@/features/game/types';

export const tokoricogx: PokemonCard = {
  id: 'tokoricogx-001',
  name: 'Tokorico GX',
  stage: 'base',
  variant: 'gx',
  type: 'electrique',
  maxHp: 170,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/tokoricogx-card.png'),
  talent: {
  name: 'Sentier Aérien',
  type: 'passive',
  effect: 'gatherEnergyOnPlayThenSwitch',
  energyType: 'electrique',
  description:
    "Lorsque vous jouez ce Pokémon de votre main sur votre Banc pendant votre tour, vous pouvez déplacer autant d'Énergies Électrique que vous le voulez de vos autres Pokémon vers ce Pokémon. Dans ce cas, échangez ce Pokémon avec l'un de vos Pokémon sur le terrain (même ligne).",
},
  attacks: [
    
    {
      name: 'Griffe Gratte-Ciel',
      damage: 130,
      energyCost: 3,
      requiredEnergies: {
        electrique: 2,
      },
    },
  ],
};