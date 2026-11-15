import type { PokemonCard } from '@/features/game/types';

export const dracaufeutcg: PokemonCard = {
  id: 'dracaufeu-001',
  name: 'Dracaufeu',
  stage: 'niveau2',
  variant: 'normal',
  type: 'feu',
  maxHp: 150,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/dracaufeu-tcg.png'),
  attacks: [
   
    {
      name: 'Danse Flammes',
      damage: 150,
      energyCost: 4,
      requiredEnergies: {
        feu: 2,
      },

      effects: [{      type: 'discardTypedEnergy',      amount: 2,      energyType: 'feu',    },  ],

     effectText:        'Défaussez 2 Energies Feu de ce Pokémon.',
    },
  ],
};