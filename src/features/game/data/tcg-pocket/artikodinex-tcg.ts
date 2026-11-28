import type { PokemonCard } from '@/features/game/types';

export const artikodinextcg: PokemonCard = {
  id: 'artikodinextcg-001',
  name: 'Artikodin EX',
  stage: 'base',
  variant: 'ex',
  type: 'eau',
  maxHp: 140,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/artikodinex-tcg.png'),
  attacks: [
   {
      name: 'Aile Glace',
      damage: 40,
      energyCost: 2,
      requiredEnergies: {
        eau: 1,
      },

    },
    {
      name: 'Blizzard',
      damage: 80,
      energyCost: 3,
      requiredEnergies: {
        eau: 3,
      },

      script: [
   { action: 'damage', amount: 10,  target :{side: 'opponent', who: 'all',includePlayer: true, filter: {position: 'bench'}}},
],
effectText: "Cette attaque inflige aussi 10 dégats à chaque Pokémon de Banc de Votre adversaire.",
    },
  ],
};