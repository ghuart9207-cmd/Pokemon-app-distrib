import type { PokemonCard } from '@/features/game/types';

export const archeomire: PokemonCard = {
  id: 'archeomire-001',
  name: 'Archéomire',
  stage: 'base',
  variant: 'normal',
  type: 'metal',
  maxHp: 60,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/archeomire-card.png'),
  attacks: [
    
    
    {
      name: 'Hypnose',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { metal: 1,},

      effects: [ { type: 'sleep',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant endormi.',
    },
    {
      name: 'Attaque Tournante',
      damage: 20,
      energyCost: 2,
   

    },
  ],
};