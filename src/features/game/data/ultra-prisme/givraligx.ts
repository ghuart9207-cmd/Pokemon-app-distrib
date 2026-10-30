import type { PokemonCard } from '@/features/game/types';

export const givraligx: PokemonCard = {
  id: 'givraligx-001',
  name: 'Givrali GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'eau',
  maxHp: 200,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/givraligx-card.png'),
  talent: {
  name: 'Regard Glacial',
  type: 'passive',
  effect: 'negateOpponentGxExTalents',
  description:
    "Tant que ce Pokémon est votre Pokémon actif, les Pokémon-GX et Pokémon-EX de votre adversaire en jeu n'ont pas de talent.",
},
  attacks: [
    
    {
      name: 'Kunai Givré',
      damage: 90,
      energyCost: 3,
      requiredEnergies: {
        eau: 1,
      },

     

      secondaryBenchOrPlayerDamage: 30,

      effectText:
        'Cette attaque inflige aussi 30 dégâts à l’un des Pokémon de banc de votre adversaire.',
    },
  ],
};