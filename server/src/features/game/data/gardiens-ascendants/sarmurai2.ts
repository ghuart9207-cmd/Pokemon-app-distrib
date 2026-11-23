import type { PokemonCard } from '@/features/game/types';

export const sarmurai2: PokemonCard = {
  id: 'sarmurai-002',
  name: 'Sarmurai',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 130,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sarmurai2-card.png'),
  talent: {
  name: 'Cuirasse',
  type: 'passive',
  effect: 'reduceAllAttackDamage',
  amount: 30,
  description: 'Ce Pokémon subit 30 dégâts de moins provenant des attaques.',
},
  attacks: [
    
    {
      name: 'Griffes résolues',
      damage: 80,
      energyCost: 3,

      requiredEnergies: {
        plante: 1,
      },
      bonusDamageIfTargetGx: 70,
      effectText: 'Si le pokémon actif de votre adversaire est un Pokémon-GX, cette attaque inflige 70 dégats supplémentaires.' 
    },
      
    ],
};