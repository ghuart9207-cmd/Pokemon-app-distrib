import type { PokemonCard } from '@/features/game/types';

export const sorboul: PokemonCard = {
  id: 'sorboul-001',
  name: 'Sorboul',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sorboul-card.png'),
  attacks: [
    
    {
      name: 'Triple Tour',
      damage: 30, 
      energyCost: 1,

      requiredEnergies: {
        eau: 1,
      },
     effects: [{ type: 'bonusDamageIfTargetType', pokemonType: 'combat', amount: 30 }],
  effectText:
    'Si le Pokémon Défenseur est un Pokémon Combat, cette attaque inflige 30 dégâts supplémentaires.',
    },
      
    ],
};