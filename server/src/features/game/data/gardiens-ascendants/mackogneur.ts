import type { PokemonCard } from '@/features/game/types';

export const mackogneur: PokemonCard = {
  id: 'mackogneur-001',
  name: 'Mackogneur',
  stage: 'niveau2',
  variant: 'normal',
  type: 'combat',
  maxHp: 160,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/mackogneur-card.png'),
  
  attacks: [
    
    
    {
      name: 'Règlement de Comptes',
      damage: 20,
      energyCost: 2,
      requiredEnergies: { combat: 2,},
script: [
      { action: 'attackDamage', amount: 40, per: { count: 'energy', who: 'self', energyType: 'psy' },  },
],

      
      effectText:
        'Cette attaque inflige 40 dégâts pour chaque Énergie Psy attachée à ce Pokémon.',
    },
    {
      name: 'Sacrifice',
      damage: 150,
      energyCost: 3,
      requiredEnergies: { combat: 3,},

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