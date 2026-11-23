import type { PokemonCard } from '@/features/game/types';

export const feunardalolagx: PokemonCard = {
  id: 'feunarddalolagx-001',
  name: 'Feunard d’Alola GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'eau',
  maxHp: 210,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/feunarddalolagx-card.png'),
  
  attacks: [
    {
      name: 'Lame de Glace',
      damage: 50,
      energyCost: 2,
       targetMode: 'anyOpponentPokemon',
         effectText:    'Cette attaque inflige 50 dégats à l’un des Pokémon de votre adversaire.',
    },
    {
      name: 'Lame Tempete',
      damage: 160,
      energyCost: 3,
      requiredEnergies: {
        eau: 2,
      },
       effects: [{      type: 'discardTypedEnergy',      amount: 2,   energyType: 'eau',           },  ],
 
  effectText:    'Défaussez 2 Énergies attachées à ce Pokémon.',

    },
  ],
};