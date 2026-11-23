import type { PokemonCard } from '@/features/game/types';

export const feunardalola: PokemonCard = {
  id: 'feunard-alola-001',
  name: 'Feunard d’alola',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 110,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/feunardalola-card.png'),
  talent: {
    name: 'Barrière Lumineuse',
    type: 'passive',

    effect: 'preventAllEffectsFromExGx',

    description:
      'Évite tous les effets des attaques, y compris les dégâts, infligés à ce Pokémon par les Pokémon-GX et Pokémon-EX de votre adversaire.',
  },
  attacks: [
    {
      name: 'Onde Boréale',
      damage: 80,
      energyCost: 3,
      requiredEnergies: {
        eau: 1,
      },
    },
  ],
};
