import type { PokemonCard } from '@/features/game/types';

export const papilusion: PokemonCard = {
  id: 'papilusion-001',
  name: 'Papilusion',
  stage: 'niveau2',
  variant: 'normal',
  type: 'plante',
  maxHp: 120,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/papilusion-card.png'),
  attacks: [
    {
      name: 'Soins et Adieux',

      damage: 0,

      energyCost: 1,
      requiredEnergies: {
        plante: 1,
      },

      script: [
        { action: 'heal', amount: 999, target: { side: 'own', who: 'chosen', count:1} },
        { action: 'returnToHand', target: { side: 'own', who: 'self' } },
      ],

      effectText:
        'Soignez tous les dégâts de un de vos Pokémon. Remettez ce Pokémon ainsi que les cartes Outils Pokémon lui étant attaché dans votre main, avec ses énergies.',
    },

    {
      name: 'Para-Spore',
      damage: 60,
      energyCost: 3,

      requiredEnergies: {
        plante: 1,
      },

      coinCount: 1,

      coinEffects: [
        {
          side: 'face',
          effect: {
            type: 'paralyze',
            amount: 1,
          },
        },
      ],
      effectText: 'Lancez une pièce. Si c’est Face, le Pokémon adverse est Paralysé.',
    },
  ],
};
