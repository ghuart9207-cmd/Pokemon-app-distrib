import type { PokemonCard } from '@/features/game/types';

export const tortankextcg: PokemonCard = {
  id: 'tortankextcg-001',
  name: 'Tortank EX',
  stage: 'niveau2',
  variant: 'ex',
  type: 'eau',
  maxHp: 180,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/tortankex-tcg.png'),
  attacks: [
   {
      name: 'Surf',
      damage: 40,
      energyCost: 2,
      requiredEnergies: {
        eau: 1,
      },

    },
    {
      name: 'Aquazooka',
      damage: 100,
      energyCost: 3,
      requiredEnergies: {
        eau: 2,
      },

      effects: [
  {
    type: 'bonusDamageIfExtraEnergy',
    energyType: 'eau',
    extraEnergyCount: 2,   
    amount: 60,            
  },
],
effectText: "Si au moins 2 Énergies Eau supplémentaires sont attachées à ce Pokémon, cette attaque inflige 60 dégâts supplémentaires.",
    },
  ],
};