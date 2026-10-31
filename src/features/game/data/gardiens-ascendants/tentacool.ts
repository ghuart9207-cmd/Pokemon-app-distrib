import type { PokemonCard } from '@/features/game/types';

export const tentacool: PokemonCard = {
  id: 'tentacool-001',
  name: 'Tentacool',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tentacool-card.png'),
  attacks: [
    
    {
      name: 'Choc Détritus',
      damage: 10,
      energyCost: 1,

      effects: [{ type: 'preventTargetHealingNextOpponentTurn', amount: 1 }],
  effectText:
    "Le Pokémon Défenseur ne peut pas être soigné pendant le prochain tour de votre adversaire.",
    },
      
    ],
};