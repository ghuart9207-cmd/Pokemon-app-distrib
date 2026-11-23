import type { PokemonCard } from '@/features/game/types';

export const ekaisergx: PokemonCard = {
  id: 'ekaisergx-001',
  name: 'Ekaiser GX',
  stage: 'niveau2',
  variant: 'gx',
  type: 'dragon',
  maxHp: 240,
  retreatCost: 2,
  dragonEnergyTypes: ['electrique', 'combat'],
  artwork: require('../../../../../assets/images/ekaisergx-card.png'),
  attacks: [
    

    {
      name: 'Charge-Adamantin',
      damage: 30,
      energyCost: 1,
      effects: [
        {
          type: 'reduceDamageNextOpponentTurn',
          amount: 30,
        },
      ],

      effectText:
        'Pendant le prochain tour de votre adversaire, ce Pokémon subit 30 dégâts de moins provenant des attaques.',
    },
    {
      name: 'Déchiquetage',
      damage: 130,
      energyCost: 4,
      requiredEnergies: {
        electrique: 1,
        combat: 1,
      },
       fixedDamage: 130,
      effectText:
        'Les dégâts de cette attaque ne sont pas affectés par aucun effet en action sur le pokémon actif de votre adversaire.',
    },
  ],
};