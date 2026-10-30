import type { PokemonCard } from '@/features/game/types';

export const cradopaud2: PokemonCard = {
  id: 'cradopaud-002',
  name: 'cradopaud',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/cradopaud2-card.png'),
  attacks: [
    {
      name: 'Vantardise',
      damage: 10,
      energyCost: 1,
      requiredEnergies: {
        psy: 1,
      },
      coinCount: 1,

  coinEffects: [ { side: 'face',
    effect: {type: 'discardOpponentActiveEnergy',
        amount: 1,  }, },],

         effectText:
    'Lancez une pièce. Si c’est Face, défaussez une Énergie du Pokémon Actif de votre adversaire.',
    },
   
  ],
};