import type { PokemonCard } from '@/features/game/types';

export const terhal: PokemonCard = {
  id: 'terhal-001',
  name: 'Terhal',
  stage: 'base',
  variant: 'normal',
  type: 'metal',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/terhal-card.png'),
  attacks: [
    
    {
      name: 'Faisceau Central',
      damage: 20,
      energyCost: 1,
requiredEnergies: { metal: 1},
script: [
   { action: 'discardEnergy', amount: 1, energyType: 'metal', target: { side: 'own', who: 'self' } },
],
  effectText:
    "Défaussez une Énergie Metal de ce Pokémon.",
    },
      
    ],
};