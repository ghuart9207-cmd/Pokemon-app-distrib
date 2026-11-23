import type { PokemonCard } from '@/features/game/types';

export const solgaleo: PokemonCard = {
  id: 'solgaleo-001',
  name: 'Solgaleo',
  stage: 'base',
  variant: 'normal',
  type: 'metal',
  maxHp: 160,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/solgaleo-card.png'),
  attacks: [
    {
      name: 'Flèche Brillante',
      damage: 50,
      energyCost: 2,
      requiredEnergies: {
        metal: 1,
      },

      targetMode: 'anyOpponentPokemon',
      effectText:
        'Cette attaque inflige 50 dégats à l’un des pokémons de votre adversaire',
    },

    {
      name: 'Crocs du Halo Solaire',
      damage: 170,
      energyCost: 3,
      requiredEnergies: {
        metal: 2,
      },

      blocksNextOwnTurn: true,
      effectText:
        'Ce Pokémon ne peut pas utiliser Crocs du Halo Solaire pendant votre prochain tour.',
    },
  ],
};
