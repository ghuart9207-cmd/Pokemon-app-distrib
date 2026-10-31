import type { PokemonCard } from '@/features/game/types';

export const boumata3: PokemonCard = {
  id: 'boumata-003',
  name: 'Boumata',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 130,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/boumata3-card.png'),
  attacks: [
    
    
    {
      name: 'Flammes Calcinantes',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { feu: 1,},

      effects: [ { type: 'burn',      amount: 1, },],
effectText: 'Le Pokémon Actif de votre adversaire est maintenant Brulé.' 

    },
    {
      name: 'Artillerie Vapeur',
      damage: 100,
      energyCost: 4,
      requiredEnergies: { feu: 1,},

      
    },
  ],
};