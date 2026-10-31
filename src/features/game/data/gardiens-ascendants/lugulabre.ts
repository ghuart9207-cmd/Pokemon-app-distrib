import type { PokemonCard } from '@/features/game/types';

export const lugulabre: PokemonCard = {
  id: 'lugulabre-001',
  name: 'Lugulabre',
  stage: 'niveau2',
  variant: 'normal',
  type: 'feu',
  maxHp: 140,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/lugulabre-card.png'),
  talent: {
    name: 'Déplacement Louche',
    type: 'activated',
    effect: 'moveDamageCounterOncePerTurn',
    amount: 10,
    fromOwnPokemonOnly: true,
    description:
      "Une seule fois pendant votre tour (avant votre attaque), vous pouvez déplacer un marqueur de dégâts de l'un de vos Pokémon vers un autre.",
  },
  attacks: [
    
    
    {
      name: 'Super Roussi',
      damage: 50,
      energyCost: 1,
      requiredEnergies: { feu: 1,},

      effects: [ { type: 'burn',
      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant brulé.',
    },
  ],
};