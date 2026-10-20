import type { PokemonCard } from '@/features/game/types';

export const bruyvernegx: PokemonCard = {
  id: 'bruyvernegx-001',
  name: 'Bruyverne GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'dragon',
  maxHp: 200,
  retreatCost: 0,
  dragonEnergyTypes: ['obscurite', 'psy'],
  artwork: require('../../../../../assets/images/bruyvernegx-card.png'),
  attacks: [
    {
      name: 'Torsion',
      damage: 50,
      energyCost: 2,
      requiredEnergies: { obscurite: 1,
      },
      effects: [
  {
    type: 'preventOpponentPlayingItemsNextTurn',
    amount: 0,
  },
],
effectText:
  "Pendant le prochain tour de votre adversaire, celui-ci ne peut pas jouer de carte Objet.",
    },
    {
      name: 'Volume Sonique',
      damage: 120,
      energyCost: 3,
      requiredEnergies: { obscurite: 1,
        psy: 1,
      },

      
      

      

  
    },
  ],
};