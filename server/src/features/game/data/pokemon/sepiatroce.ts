import type { PokemonCard } from '@/features/game/types';

export const sepiatroce: PokemonCard = {
  id: 'sepiatroce-001',
  name: 'Sepiatroce',
  stage: 'niveau1',
  variant: 'normal',
  type: 'obscurite',
  maxHp: 100,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/sepiatroce-card.png'),
  attacks: [
    

    {
      name: 'Rafale Psy',
      damage: 20,
      energyCost: 1,

      requiredEnergies: {
        obscurite: 1,
      },

      
          effects: [ { type: 'confuse',
      amount: 1, },],

      effectText: 'Le Pokémon actif de votre adversaire est maintenant Confus.',
    },
    {
      name: 'Renversement d’Energie',
      damage: 70,
      energyCost: 3,
       requiredEnergies: {
        obscurite: 1,
      },
      effects: [
  {
    type: 'transferAllEnergiesToBench',
    amount: 0,
    optional: true,
  },
],
effectText:
  "Vous pouvez déplacer toutes les Énergies de ce Pokémon vers l'un de vos Pokémon de Banc.",
    },
  ],
};