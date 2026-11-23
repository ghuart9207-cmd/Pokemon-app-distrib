import type { PokemonCard } from '@/features/game/types';

export const dialgagx: PokemonCard = {
  id: 'dialgagx-001',
  name: 'Dialgagx',
  stage: 'base',
  variant: 'gx',
  type: 'dragon',
  maxHp: 180,
  retreatCost: 3,
  dragonEnergyTypes: ['metal', 'metal'],
  artwork: require('../../../../../assets/images/dialgagx-card.png'),
  attacks: [
    
    {
      
      name: 'Déchiquetage',
      damage: 80,
      energyCost: 3,
      requiredEnergies: {
        metal: 1,
      },

      fixedDamage: 80,
      effectText:
        'Les dégâts de cette attaque ne sont pas affectés par aucun effet en action sur le pokémon actif de votre adversaire.',
    },
    
  ],
};