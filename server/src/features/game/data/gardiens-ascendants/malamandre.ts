import type { PokemonCard } from '@/features/game/types';

export const malamandre: PokemonCard = {
  id: 'malamandre-001',
  name: 'Malamandre',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/malamandre-card.png'),
  talent: {
  name: 'Poison Bouillant',
  type: 'passive',
  effect: 'applyConditionsToOpponentOnPlay',
  conditions: ['poison', 'burn'],
  description:
    "Lorsque vous posez ce Pokémon sur le plateau, le Pokémon actif de votre adversaire est maintenant Empoisonné et Brûlé.",
},
  attacks: [
    
    {
      name: 'Lance-Flammes',
      damage: 90,
      energyCost: 3,

      requiredEnergies: {
        feu: 1,
      },
      effects: [ { type: 'discardEnergy', amount: 1,  }, ],
      effectText:  "Défaussez une Énergie de ce Pokémon.",
    },
      
    ],
};