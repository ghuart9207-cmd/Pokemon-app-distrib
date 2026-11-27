import type { PokemonCard } from '@/features/game/types';

export const voltalitcg: PokemonCard = {
  id: 'voltalitcg-001',
  name: 'Voltali',
  stage: 'niveau1',
  variant: 'normal',
  type: 'electrique',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/voltali-tcg.png'),
  
  attacks: [
   {
      name: 'Dard-Nuée',
      damage: 0,
      energyCost: 2,
      requiredEnergies: {
        electrique: 1,
      },
 coinCount: 4, damagePerFace: 40,
effectText:        'Lancez 4 pièces. Cette attaque inflige 40 dégâts pour chaque côté Face.',

    },
  ],
};