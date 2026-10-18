import type { PokemonCard } from '@/features/game/types';

export const crabominable: PokemonCard = {
  id: 'crabominable-001',
  name: 'Crabominable',
  stage: 'niveau1',
  variant: 'normal',
  type: 'combat',
  maxHp: 140,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/crabominable-card.png'),
  attacks: [
    {
      name: 'Marteau Courageux',

      damage: 80,

      energyCost: 1,
      requiredEnergies: {
        combat: 1,
      },

      
    },

    {
      name: 'Double Ecrasement',

      damage: 80,

      energyCost: 3,
      requiredEnergies: {
        combat: 3,
      },

      coinCount: 2,

      damagePerFace: 40,

      effectText:
        'Lancez 2 pièces. Cette attaque inflige 40 dégâts pour chaque côté Face.',
    },
  ],
};