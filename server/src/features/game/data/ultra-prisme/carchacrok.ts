import type { PokemonCard } from '@/features/game/types';

export const carchacrok: PokemonCard = {
  id: 'carchacrok-001',
  name: 'Carchacrok',
  stage: 'niveau2',
  variant: 'normal',
  type: 'dragon',
  maxHp: 150,
  retreatCost: 0,
  dragonEnergyTypes: ['combat', 'combat'],
  artwork: require('../../../../../assets/images/carchacrok-card.png'),
  attacks: [
    {
      name: 'Plongeon Rapide',
      damage: 50,
      energyCost: 2,
      targetMode: 'anyOpponentPokemon',
        effectText: "Cette attaque inflige 50 dégâts à l'un des Pokémon de votre adversaire.",
    },
    {
      name: 'Lames Royales',
      damage: 100,
      energyCost: 3,
      requiredEnergies: { combat : 1
      },

      effectText:
        'Si vous avez joué Cynthia de votre main pendant votre tour, cette attaque inflige 100 dégats supplémentaires. ',
    },
  ],
};