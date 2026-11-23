import type { PokemonCard } from '@/features/game/types';

export const lunala: PokemonCard = {
  id: 'lunala-001',
  name: 'Lunala',
  stage: 'niveau2',
  variant: 'normal',
  type: 'psy',
  maxHp: 160,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/lunala-card.png'),
  
  attacks: [
    
    
    {
      name: 'Coup Fracassant',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { psy: 1,},
script: [
      { action: 'attackDamage', amount: 40, per: { count: 'energy', who: 'self', energyType: 'psy' },  },
],

      
      effectText:
        'Cette attaque inflige 40 dégâts pour chaque Énergie Psy attachée à ce Pokémon.',
    },
    {
      name: 'Ailes de Halo Lunaire',
      damage: 130,
      energyCost: 3,
      requiredEnergies: { psy: 3,},

      script: [
        { action: 'moveEnergy', amount: 1, target: { side: 'own', who: 'self' }, to: { side: 'own', who: 'chosen',  },},
     { action: 'moveEnergy', amount: 1, target: { side: 'own', who: 'self' }, to: { side: 'own', who: 'chosen',  },},
     { action: 'moveEnergy', amount: 1, target: { side: 'own', who: 'self' }, to: { side: 'own', who: 'chosen',  },},
     { action: 'moveEnergy', amount: 1, target: { side: 'own', who: 'self' }, to: { side: 'own', who: 'chosen',  },},
      ],


      
      effectText:
        'Déplacez toutes les Énergies attachées à ce Pokémon sur un de vos autres Pokémon.',
    },
  ],
};