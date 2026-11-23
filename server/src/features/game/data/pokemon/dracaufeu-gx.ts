import type { PokemonCard } from '@/features/game/types';

export const dracaufeuGx: PokemonCard = {
  id: 'dracaufeu-gx-001',
  name: 'Dracaufeu-Gx',
  stage: 'niveau2',
  variant: 'gx',
  type: 'feu',
  maxHp: 250,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/dracaufeugx-card.png'),
  attacks: [
    {
      name: 'Cru-Aile',
      damage: 70,
      energyCost: 3,
    },
    {
      name: 'Cru-Aile',
      damage: 300,
      energyCost: 5,

      requiredEnergies: {
        feu: 3,
      },

      effects: [
        {
          type: 'discardEnergy',
          amount: 3,
        },
      ],
      effectText: 'Défaussez 3 Energies de ce pokémon.',
    },
  ],
};
