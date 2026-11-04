import type { PokemonCard } from '@/features/game/types';

export const sulfuraextcg: PokemonCard = {
  id: 'sulfuraex-001',
  name: 'Sulfura EX',
  stage: 'base',
  variant: 'ex',
  type: 'feu',
  maxHp: 140,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sulfuraex-tcg.png'),
  attacks: [
   {
  name: 'Danse Infernale',
  damage: 0,
  energyCost: 1,
  requiredEnergies: {
        feu: 1,
      },
  coinCount: 3,                
  effects: [
    {
      type: 'attachEnergyToBench',
      amount: 1,                
      energyType: 'feu',
      
      targetPokemonType: 'feu', 
      perCoinFace: true,
    },
  ],
  effectText: 'Lancez 3 pièces. Pour chaque côté face, attachez une Énergie Feu à l\'un de vos Pokémon Feu de Banc.',
},
    {
      name: 'Explosion de Chaleur',
      damage: 70,
      energyCost: 3,
      requiredEnergies: {
        feu: 1,
      },

    
    },
  ],
};