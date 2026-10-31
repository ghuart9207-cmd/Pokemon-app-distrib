import type { PokemonCard } from '@/features/game/types';

export const lucanongx: PokemonCard = {
  id: 'lucanongx-001',
  name: 'Lucanon GX',
  stage: 'niveau2',
  variant: 'gx',
  type: 'electrique',
  maxHp: 240,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/lucanongx-card.png'),
  attacks: [
    {
      name: 'Rayon Chargé',
      damage: 50,
      energyCost: 1,
      requiredEnergies: {
        electrique: 1,
      },

      effects: [
        {
          type: 'recoverEnergy',
          amount: 1,
        },
      ],

      effectText:
        'Prenez 1 Énergie dans votre pile de défausse et attachez-la à ce Pokémon.',
    },
    {
      name: 'Super Elecanon',
      damage: 180,
      energyCost: 4,
      requiredEnergies: {
        electrique: 1,
      },
      effects: [ { type: 'discardEnergy', amount: 2,  }, ],
      effectText:'Défaussez 2 Energies de ce Pokémon.',
    },
  ],
};
