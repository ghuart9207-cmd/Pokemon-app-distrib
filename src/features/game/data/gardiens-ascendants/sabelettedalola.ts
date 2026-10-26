import type { PokemonCard } from '@/features/game/types';

export const sabelettedalola: PokemonCard = {
  id: 'sabelettedalola-001',
  name: 'Sabelette d’Alola',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/sabelettedalola-card.png'),
  attacks: [
    
    
    {
      name: 'Boul’Armure',
      damage: 0,
      energyCost: 0,
     
coinCount: 1,
  coinEffects: [
    {
      side: 'face',
      effect: { type: 'preventAllAttackDamageNextOpponentTurn', amount: 1 },
    },
  ],
  effectText:
    "Lancez une pièce. Si c'est Face, évitez tous les dégâts infligés à ce Pokémon par des attaques pendant le prochain tour de votre adversaire.",

 
    },
    {
      name: 'Ball’Glace',
      damage: 30,
      energyCost: 3,
     requiredEnergies: { eau: 1},


 
    },
  ],
};