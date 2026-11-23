import type { PokemonCard } from '@/features/game/types';

export const palkiagx: PokemonCard = {
  id: 'palkiagx-001',
  name: 'Palkiagx',
  stage: 'base',
  variant: 'gx',
  type: 'dragon',
  maxHp: 180,
  retreatCost: 3,
  dragonEnergyTypes: ['eau', 'eau'],
  artwork: require('../../../../../assets/images/palkiagx-card.png'),
  attacks: [
    
    {
      
      name: 'Contrôle Spatial',
      damage: 0,
      energyCost: 1,
      requiredEnergies: {
        eau: 1,
      },

      effects: [{ type: 'gatherEnergyFromBench', amount: 0 }],
effectText: "Déplacez autant d'Énergies que vous le souhaitez de vos Pokémon de Banc vers ce Pokémon.",
    },
    {
      
      name: 'Pression Hydroélectrique',
      damage: 60,
      energyCost: 3,
      

      effects: [{      type: 'damagePerAttachedEnergy',   energyType: 'eau',   amount: 20,    },],
     effectText:
    'Cette attaque inflige 20 dégâts supplémentaires pour chaque Énergie Eau attachée à ce Pokémon .',
        
    },
    
  ],
};