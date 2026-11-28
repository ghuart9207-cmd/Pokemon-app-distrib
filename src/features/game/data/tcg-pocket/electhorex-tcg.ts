import type { PokemonCard } from '@/features/game/types';

export const electhorextcg: PokemonCard = {
  id: 'electhorextcg-001',
  name: 'Electhor EX',
  stage: 'base',
  variant: 'ex',
  type: 'electrique',
  maxHp: 130,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/electhorex-tcg.png'),
  
  attacks: [
   {
      name: 'Picpic',
      damage: 20,
      energyCost: 1,
      requiredEnergies: {
        electrique: 1,
      },


    },
    {
      name: 'Rafale d’Eclairs',
      damage: 0,
      energyCost: 3,
      requiredEnergies: {
        electrique: 3,
      },
 coinCount: 4, damagePerFace: 50,
effectText:        'Lancez 4 pièces. Cette attaque inflige 50 dégâts pour chaque côté Face.',

    },
  ],
};