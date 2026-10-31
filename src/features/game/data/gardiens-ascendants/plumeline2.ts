import type { PokemonCard } from '@/features/game/types';

export const plumeline2: PokemonCard = {
  id: 'plumeline-002',
  name: 'Plumeline',
  stage: 'base',
  variant: 'normal',
  type: 'electrique',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/plumeline2-card.png'),
  attacks: [
    
    
    {
      name: 'Danse-Plume',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { electrique: 1,},
effects: [  {    type: 'setNextTurnAttackBaseDamage',    amount: 100,    attackName:'Poing Pom-Pom',  },],
      effectText: 'Pendant votre prochain tour, les dégats de base de l’attaque Poing Pom-Pom de ce Pokémon sont de 100.' 
    },
    {
      name: 'Poing Pom-Pom',
      damage: 20,
      energyCost: 1,
      requiredEnergies: { electrique: 1,},

    },
  ],
};