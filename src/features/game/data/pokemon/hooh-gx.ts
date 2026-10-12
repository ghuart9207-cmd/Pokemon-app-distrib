import type { PokemonCard } from '@/features/game/types';

export const hoohGx: PokemonCard = {
  id: 'hoohgx-001',
  name: 'Ho-Oh GX',
  stage: 'base',
  variant: 'gx',
  type: 'feu',
  maxHp: 190,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/hoohgx-card.png'),
  attacks: [
    {
      name: 'Feu Sacré',
      damage: 50,
      energyCost: 3,
      requiredEnergies: {
        feu: 1,
      },

      targetMode: 'anyOpponentPokemon',
      effectText:
        'Cette attaque inflige 50 dégats à l’un des pokémons de votre adversaire',
    },

    {
      name: 'Éclat du Phénix',
      damage: 180,
      energyCost: 4,
      requiredEnergies: {
        feu: 3,
      },

      blocksNextOwnTurn: true,
      effectText:
        'Ce Pokémon ne peut pas utiliser Éclat du Phénix pendant votre prochain tour.',
    },
  ],
};
