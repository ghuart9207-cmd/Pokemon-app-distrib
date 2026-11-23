import type { PokemonCard } from '@/features/game/types';

export const tokopiyongx: PokemonCard = {
  id: 'tokopiyongx-001',
  name: 'Tokopiyongx',
  stage: 'base',
  variant: 'gx',
  type: 'psy',
  maxHp: 170,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tokopiyongx-card.png'),
  talent: {
  name: 'Relais Miracle',
  type: 'passive',
  effect: 'script',
  description: 'Lorsque vous jouez ce Pokémon de votre main sur votre Banc pendant votre tour, vous pouvez invoquer une carte Supporter dans votre main.',
  script: [
    { action: 'whenPlayed', target: { who: 'self' },
  script: [
    { action: 'summon', kind: 'supporter' },
  ],},
],
},
  attacks: [
    
    {
      name: 'Propulsion Energie',
      damage: 0,
      energyCost: 2,
      effects: [
    {
      type: 'damagePerAttachedEnergy',
      amount: 20,
    },
     { type: 'damagePerOpponentActiveEnergy', amount: 20 },
  ],
   
    
  

  effectText:
    'Cette attaque inflige 20 dégâts pour chaque Énergie attachée au 2 Pokémon Actifs.',
    },
  ],
};