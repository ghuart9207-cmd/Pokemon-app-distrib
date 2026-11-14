import type { PokemonCard } from '@/features/game/types';

export const necrozmacouchantgx: PokemonCard = {
  id: 'necrozmacouchantgx-001',
  name: 'Necrozma Couchant GX',
  stage: 'base',
  variant: 'gx',
  type: 'metal',
  maxHp: 190,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/necrozmacouchantgx-card.png'),
  
  attacks: [
    
    {
      name: 'Tranch’Griffe',
      damage: 60,
      energyCost: 3,

      
    },
    {
      name: 'Tempete Météorique',
      damage: 220,
      energyCost: 4,

      requiredEnergies: {
        metal: 3,
      },
 effects: [ { type: 'discardEnergy', amount: 3,  }, ],
       effectText:
        'Défaussez 3 Energies de ce Pokémon.',
    },
  ],
};