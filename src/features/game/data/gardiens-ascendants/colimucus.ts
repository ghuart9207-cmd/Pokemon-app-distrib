import type { PokemonCard } from '@/features/game/types';

export const colimucus: PokemonCard = {
  id: 'colimucus-001',
  name: 'Colimucus',
  stage: 'niveau1',
  variant: 'normal',
  type: 'dragon',
  maxHp: 70,
  retreatCost: 3,
  dragonEnergyTypes: ['eau', 'fee'],
  artwork: require('../../../../../assets/images/colimucus-card.png'),
  attacks: [
    

    {
      name: 'Division',
      damage: 0,
      energyCost: 1,
      effects: [
        {
          type: 'summonPokemon',
          amount: 2,
          summonCardId: 'colimucus-001',
        },
      ],
      effectText:
        "Invoquez 2 Colimucus sur votre banc.",
    },
    {
      name: 'Charge',
      damage: 20,
      energyCost: 2,
      requiredEnergies: {
        eau: 1,
        fee: 1,
      },
    },
  ],
};