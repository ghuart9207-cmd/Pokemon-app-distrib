import type { PokemonCard } from '@/features/game/types';

export const zygarde: PokemonCard = {
  id: 'zygarde-001',
  name: 'Zygarde',
  stage: 'base',
  variant: 'normal',
  type: 'dragon',
  maxHp: 150,
  retreatCost: 4,
  dragonEnergyTypes: ['obscurite', 'fee'],
  artwork: require('../../../../../assets/images/zygarde-card.png'),
  attacks: [
    {
      name: 'Ecras’Terre',
      damage: 80,
      energyCost: 3,
    },
    {
      name: 'Sanction Suprême',
      damage: 150,
      energyCost: 4,
      requiredEnergies: { obscurite: 1,
        fee: 1,
      },

      effects: [
        {
          type: 'discardTypedEnergy',
          amount: 1,
          energyType: 'fee',
        },
        {
          type: 'discardTypedEnergy',
          amount: 1,
          energyType: 'obscurite',
        },
        
      ],
      

      

      effectText:
        'Défaussez une Énergies obscure et une Énergie Fée de ce Pokémon. ',
    },
  ],
};
