import type { PokemonCard } from '@/features/game/types';

export const darkraigx: PokemonCard = {
  id: 'darkraigx-001',
  name: 'Darkrai GX',
  stage: 'base',
  variant: 'gx',
  type: 'obscurite',
  maxHp: 180,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/darkraigx-card.png'),
  talent: {
  name: 'Renouveau',
  type: 'activated',
  effect: 'recoverFromDiscardOncePerGame',
  description:
    "Une fois pendant la partie, pendant votre tour, si ce Pokémon est dans votre pile de défausse, vous pouvez l’invoquez sur votre banc avec une Énergie Obscure de votre pile de défausse.",
},
  attacks: [
    
    {
      name: 'Pénombre Pourfendue',
      damage: 130,
      energyCost: 3,

      requiredEnergies: {
        obscurite: 2,
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