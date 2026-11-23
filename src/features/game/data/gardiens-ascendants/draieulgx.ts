import type { PokemonCard } from '@/features/game/types';

export const draieulgx: PokemonCard = {
  id: 'draieul GX-001',

  name: 'Draieul GX',

  stage: 'base',

  variant: 'gx',

  type: 'normal',

  maxHp: 180,

  retreatCost: 2,

  artwork: require('../../../../../assets/images/draieulgx-card.png'),

  attacks: [
    {
      name: 'Lame Vertueuse',

      damage: 20,

      energyCost: 1,
      

      script: [
        { action: 'discardTool', target: { side: 'opponent', who: 'active'} }
  ],
  effectText:
    'Défaussez un Outil du Pokémon actif de votre adversaire.',
    },
     {
      name: 'Dracolère',

      damage: 80,

      energyCost: 3,
      
script: [
    { action: 'attackDamage',amount: 70, if: { count: 'pokemon', side: 'own', filter: { position: 'bench', damaged: true } }  }
],
     effectText:
    'Cette attaque inflige 70 dégâts supplémentaires si des marqueurs de dégâts sont placés sur vos Pokémon de banc.',
    },
     
  ],
};