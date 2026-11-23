import type { PokemonCard } from '@/features/game/types';

export const tarinorme: PokemonCard = {
  id: 'tarinorme-001',
  name: 'Tarinorme',
  stage: 'niveau1',
  variant: 'normal',
  type: 'metal',
  maxHp: 130,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/tarinorme-card.png'),
  attacks: [
    {
      name: 'Chaine d’Energie',
      damage: 30,
      energyCost: 1,
      requiredEnergies: {
        metal: 1,
      },

      effects: [
        {
          type: 'recoverEnergy',
          amount: 1,
          
        },
      ],

      effectText:
        'Prenez une Énergie de votre pile de défausse et attachez-la à ce Pokémon.',
    },
    {
      name: 'Rayon Gemme',
      damage: 120,
      energyCost: 4,
      
    },
  ],
};
