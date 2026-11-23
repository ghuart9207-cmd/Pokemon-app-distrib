import type { PokemonCard } from '@/features/game/types';

export const meteno: PokemonCard = {
  id: 'meteno-001',
  name: 'Météno',
  stage: 'base',
  variant: 'normal',
  type: 'combat',
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/meteno-card.png'),
  attacks: [
    
    
    {
      name: 'Météores',
      damage: 20,
      energyCost: 1,
     

      fixedDamage: 20,
      effectText:
        'Les dégâts de cette attaque ne sont pas affectés par aucun effet en action sur le pokémon actif de votre adversaire.',
    },
    {
      name: 'Explosion Cosmique',
      damage: 190,
      energyCost: 3,
      requiredEnergies: { combat: 2,},
 effects: [  {    type: 'recoil',    amount: 999,  },],


      
      effectText:
        'Ce Pokémon est KO.',
    },
  ],
};