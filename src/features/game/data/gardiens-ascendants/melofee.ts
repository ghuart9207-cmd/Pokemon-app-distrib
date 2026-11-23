import type { PokemonCard } from '@/features/game/types';

export const melofee: PokemonCard = {
  id: 'melofee-001',
  name: 'Mélofée',
  stage: 'base',
  variant: 'normal',
  type: 'fee',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/melofee-card.png'),
  attacks: [
    
    
    {
      name: 'Gifle',
      damage: 10,
      energyCost: 1,
     requiredEnergies: { fee: 1,},

      
    },
    {
      name: 'Par Ici',
      damage: 0,
      energyCost: 2,
     
 script: [
    
    { action: 'switch', target: { side: 'opponent', who: 'active' } },
 ],

      
      effectText:
        'Echangez l’un des Pokémon de Banc de votre adversaire avec son Pokémon Actif..',
    },
  ],
};