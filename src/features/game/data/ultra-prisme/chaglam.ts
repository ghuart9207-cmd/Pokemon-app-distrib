import type { PokemonCard } from '@/features/game/types';

export const chaglam: PokemonCard = {
  id: 'chaglam-001',
  name: 'Chaglam',
  stage: 'base',
  variant: 'normal',
  type: 'normal',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/chaglam-card.png'),
  attacks: [
    
    
    {
      name: 'Morsure Douce',
      damage: 10,
      energyCost: 1,
      

     effects: [{ type: 'reduceTargetAttackDamageNextTurn', amount: 40 }],
effectText: "Pendant le prochain tour de votre adversaire, les attaques du Pokémon Défenseur infligent 40 dégâts de moins.",

    },
    
  ],
};