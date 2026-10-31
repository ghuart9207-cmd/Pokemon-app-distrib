import type { PokemonCard } from '@/features/game/types';

export const oniglali: PokemonCard = {
  id: 'oniglali-001',
  name: 'Oniglali',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 120,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/oniglali-card.png'),
  attacks: [
    
    {
      name: 'Machouille',
      damage: 40,
      energyCost: 2,

      requiredEnergies: {
        eau: 2,
      },
      coinCount: 1,

  coinEffects: [ { side: 'face',
    effect: {type: 'discardOpponentActiveEnergy',
        amount: 1,  }, },],

         effectText:
    'Lancez une pièce. Si c’est Face, défaussez une Énergie du Pokémon Actif de votre adversaire.',
    },
    {
      name: 'Banquise Furieuse',
      damage: 70,
      energyCost: 3,

      requiredEnergies: {
        eau: 3,
      },
      effects: [{ type: 'bonusDamageIfSelfDamaged', amount: 80 }],
  effectText:
    'Si des marqueurs de dégâts sont placés sur ce Pokémon, cette attaque inflige 80 dégâts supplémentaires.',
    },
    ],
};