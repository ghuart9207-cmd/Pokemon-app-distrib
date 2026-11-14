import type { PokemonCard } from '@/features/game/types';

export const boumatagx: PokemonCard = {
  id: 'boumatagx-001',
  name: 'Boumata GX',
  stage: 'base',
  variant: 'gx',
  type: 'feu',
  maxHp: 190,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/boumatagx-card.png'),
  attacks: [
    {
      name: 'Carapiège',

      damage: 20,

      energyCost: 2,
      effects: [{ type: 'retaliateDamageNextOpponentTurn', amount: 80 }],
  effectText:
    "Pendant le prochain tour de votre adversaire, si ce Pokémon subit les dégâts d'une attaque , placez 8 marqueurs de dégâts sur le Pokémon attaquant.",

      
    },

    {
      name: 'Flamme Eclatante',
      damage: 160,
      energyCost: 3,
      requiredEnergies: {
        feu: 2,
      },
      effects: [{      type: 'discardTypedEnergy',      amount: 2,      energyType: 'feu',    },  ],
 
  effectText:    'Défaussez 2 Énergies Feu attachées à ce Pokémon.',

    },
  ],
};