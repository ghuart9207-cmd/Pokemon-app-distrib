import type { PokemonCard } from '@/features/game/types';

export const nirondelle: PokemonCard = {
  id: 'nirondelle-001',
  name: 'Nirondelle',
  stage: 'base',
  variant: 'normal',
  type: 'normal',
  maxHp: 60,
  retreatCost: 1,
  
  artwork: require('../../../../../assets/images/nirondelle-card.png'),
  attacks: [
    

   
    {
      name: 'Attaque Prudente',
      damage: 20,
      energyCost: 1,
      effects: [
  {
    type: 'recoil',
    amount: 10,
  },
],
      effectText: 'Ce Pokémon s’inflige 10 dégâts.',
    },
  ],
};