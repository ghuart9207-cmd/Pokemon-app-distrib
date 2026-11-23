import type { PokemonCard } from '@/features/game/types';

export const dracaufeuextcg: PokemonCard = {
  id: 'dracaufeuex-001',
  name: 'Dracaufeu EX',
  stage: 'niveau2',
  variant: 'ex',
  type: 'feu',
  maxHp: 180,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/dracaufeuex-tcg.png'),
  attacks: [
   {
      name: 'Tranche',
      damage: 60,
      energyCost: 3,
      requiredEnergies: {
        feu: 1,
      },

    },
    {
      name: 'Tempete Ecarlate',
      damage: 200,
      energyCost: 4,
      requiredEnergies: {
        feu: 2,
      },

      effects: [{      type: 'discardTypedEnergy',      amount: 2,      energyType: 'feu',    },  ],

     effectText:        'Défaussez 2 Energies Feu de ce Pokémon.',
    },
  ],
};