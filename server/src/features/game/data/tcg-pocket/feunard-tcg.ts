import type { PokemonCard } from '@/features/game/types';

export const feunardtcg: PokemonCard = {
  id: 'feunard-001',
  name: 'Feunard',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/feunard-tcg.png'),
  attacks: [
   
    {
      name: 'Lances-Flammes',
      damage: 90,
      energyCost: 2,
      requiredEnergies: {
        feu: 2,
      },

      effects: [{      type: 'discardTypedEnergy',      amount: 1,      energyType: 'feu',    },  ],

     effectText:        'Défaussez 1 Energies Feu de ce Pokémon.',
    },
  ],
};