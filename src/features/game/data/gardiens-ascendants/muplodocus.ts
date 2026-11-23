import type { PokemonCard } from '@/features/game/types';

export const muplodocus: PokemonCard = {
  id: 'muplodocus-001',
  name: 'Muplodocus',
  stage: 'niveau2',
  variant: 'normal',
  type: 'dragon',
  maxHp: 160,
  retreatCost: 3,
  dragonEnergyTypes: ['eau', 'fee'],
  artwork: require('../../../../../assets/images/muplodocus-card.png'),
  attacks: [
    

    {
      name: 'Méga Fouet',
      damage: 0,
      energyCost: 1,
      script: [
        { action: 'damage', amount : 20, per: { count: 'energy', who : 'self', }, target: { side: 'opponent', who: 'chosen' } },
      ],
      effectText:
        "Cette attaque inflige 20 dégâts pour chaque Energie attachées à ce Pokémon à l'un des Pokémon de l'adversaire.",
    },
    {
      name: 'Frappe Glissante',
      damage: 130,
      energyCost: 3,
      requiredEnergies: {
        eau: 1,
        fee: 1,
      },
       effects: [
        {
          type: 'forceOpponentActiveSwitch',

          amount: 1,
        },
      ],

      effectText:
        'Votre adversaire échange son Pokémon actif avec l’un de ses Pokémon de banc. (L’échange se fait horizontalement)',
    },
  ],
};