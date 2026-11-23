import type { PokemonCard } from '@/features/game/types';

export const simiabraz: PokemonCard = {
  id: 'simiabraz-001',
  name: 'Simiabraz',
  stage: 'niveau2',
  variant: 'normal',
  type: 'feu',
  maxHp: 130,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/simiabraz-card.png'),
  talent: {
  name: 'Combattant Incandescent',
  type: 'passive',
  effect: 'increaseOpponentBurnDamage',
  amount: 60,   // dégâts de brûlure au lieu de 20 (6 marqueurs)
  description:
    'Placez 6 marqueurs de dégâts au lieu de 2 sur le Pokémon Brûlé de votre adversaire à la fin de votre tour.',
},
  attacks: [
    
    
    {
      name: 'Super Roussi',
      damage: 50,
      energyCost: 2,
      requiredEnergies: { feu: 1,},

      effects: [ { type: 'burn',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant brulé.',
    },
  ],
};