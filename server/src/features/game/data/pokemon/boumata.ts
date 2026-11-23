import type { PokemonCard } from '@/features/game/types';

export const boumata: PokemonCard = {
  id: 'boumata-001',
  name: 'Boumata',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 130,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/boumata-card.png'),
  attacks: [
    {
      name: 'Manteu de Feu',
      damage: 30,
      energyCost: 2,
      requiredEnergies: {
        feu: 1,
      },

      effects: [
        {
          type: 'recoverEnergy',
          amount: 1,
          energyType: 'feu',
        },
      ],

      effectText:
        'Prenez 1 Énergie Feu dans votre pile de défausse et attachez-la à ce Pokémon.',
    },
    {
      name: 'Explosion de Chaleur',
      damage: 70,
      energyCost: 3,
      requiredEnergies: {
        feu: 1,
      },
    },
  ],
};
