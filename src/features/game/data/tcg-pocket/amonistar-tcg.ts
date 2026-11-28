import type { PokemonCard } from '@/features/game/types';

export const amonistartcg: PokemonCard = {
  id: 'amonistartcg-001',
  name: 'Amonistar',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 140,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/amonistar-tcg.png'),
  
  attacks: [
   {
      name: 'Siphon Antique',
      damage: 70,
      energyCost: 3,
      requiredEnergies: {
        eau: 1,
      },
script: [
   { action: 'prevent', prevent: ['attack'],duration: 'opponentNextTurn', target :{side: 'opponent', who: 'active'}},
],
effectText: 'Pendant le prochain tour de votre adversaire, le pokémon Défenseur ne peut pas attaquer'
    },
    
  ],
};