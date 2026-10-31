import type { PokemonCard } from '@/features/game/types';

export const boustiflor: PokemonCard = {
  id: 'boustiflor-001',
  name: 'Boustiflor',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/boustiflor-card.png'),
  attacks: [
    
    {
      name: 'Acide Trouble',
      damage: 40,
      energyCost: 2,

      requiredEnergies: {
        plante: 1,
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