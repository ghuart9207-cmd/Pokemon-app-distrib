import type { PokemonCard } from '@/features/game/types';

export const malamandreGx: PokemonCard = {
  id: 'malamandregx-001',
  name: 'Malamandre GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'feu',
  maxHp: 200,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/malamandregx-card.png'),
  attacks: [
    {
      name: 'Griffes Diaboliques',

      damage: 0,

      energyCost: 2,
      requiredEnergies: {
        feu: 2,
      },

      bonusDamageEveryTwoRounds: 50,

      effectText: 'Cette attaque inflige 50 dégâts supplémentaires tous les 2 tours.',
    },

    {
      name: 'Explosion de Chaleur',
      damage: 110,
      energyCost: 2,
      requiredEnergies: {
        feu: 2,
      },
    },
  ],
};
