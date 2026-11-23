import type { PokemonCard } from '@/features/game/types';

export const noctunoir: PokemonCard = {
  id: 'noctunoir-001',
  name: 'Noctunoir',
  stage: 'niveau2',
  variant: 'normal',
  type: 'psy',
  maxHp: 150,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/noctunoir-card.png'),
  talent: {
    name: 'Invitation Obscure',
    type: 'passive',
    effect: 'damageOpponentOnPlay',
    amount: 30,

    description: 'Lorsque votre adversaire pose un Pokémon, ce Pokémon subit 30 dégâts.',
  },
  attacks: [
    {
      name: 'Emprise Mentale',

      damage: 30,

      energyCost: 3,
      requiredEnergies: {
        psy: 1,
      },

      bonusDamagePerOpponentBenchPokemon: 30,

      effectText:
        'Cette attaque inflige 30 dégâts supplémentaires pour chacun des Pokémon de banc de votre adversaire.',
    },
  ],
};
