import type { PokemonCard } from '@/features/game/types';

export const luxray: PokemonCard = {
  id: 'luxray-001',
  name: 'Luxray',
  stage: 'niveau2',
  variant: 'normal',
  type: 'electrique',
  maxHp: 150,
  retreatCost: 0,
  artwork: require('../../../../../assets/images/luxray-card.png'),
  talent: {
  name: 'Croc Intimidant',
  type: 'passive',
  effect: 'reduceOpposingColumnAttackDamage',
  amount: 30,   
  description:
    "Tant que ce Pokémon est votre Pokémon actif, les attaques du Pokémon actif de votre adversaire infligent 30 dégâts de moins.",
},
  attacks: [
    
    {
      name: 'Flèche Survolté',
      damage: 150,
      energyCost: 3,
requiredEnergies: { electrique: 2,
      },
      effects: [
        {
          type: 'discardTypedEnergy',
          amount: 99,
          energyType: 'electrique',
        },
      ],

      targetMode: 'anyOpponentPokemon',

      effectText:
        'Défaussez toute l’Energie Electrique attachées à ce Pokémon. Choisissez 1 Pokémon adverse et infligez-lui 150 dégâts.',
    },
  ],
};