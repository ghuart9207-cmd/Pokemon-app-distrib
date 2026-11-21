import type { PokemonCard } from '@/features/game/types';

export const scrutella: PokemonCard = {
  id: 'scrutella-001',
  name: 'Scrutella',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/scrutella-card.png'),
  attacks: [
    
    {
      name: 'Baiser Volé',
      damage: 0,
      energyCost: 1,

      requiredEnergies: {
        psy: 1,
      },

    script: [
  { action: 'counters', amount: 1, target: { side: 'opponent', who: 'chosen' } },
],
  

      effectText:  "Placez un marqueur de dégâts sur l'un des Pokémon de votre adversaire.",
    },
      
    ],
};