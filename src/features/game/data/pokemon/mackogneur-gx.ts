import type { PokemonCard } from '@/features/game/types';

export const mackogneurGx: PokemonCard = {
  id: 'mackogneur-gx-001',
  name: 'Mackogneur GX',
  stage: 'niveau2',
  variant: 'gx',
  type: 'combat',
  maxHp: 250,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/mackogneurgx-card.png'),
  attacks: [
    {
      name: 'Coupe Transversale',
      damage: 60,
      energyCost: 2,
      requiredEnergies: {
        combat: 2,
      },

      bonusDamageIfTargetEvolved: 60,

      effectText:
        'Si le Pokémon actif de votre adversaire est un Pokémon évolutif, cette attaque inflige 60 dégâts supplémentaires.',
    },
    {
      name: 'Brise Fondation',
      damage: 130,
      energyCost: 3,
      requiredEnergies: {
        combat: 3,
      },
    },
  ],
};
