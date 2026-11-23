import type { PokemonCard } from '@/features/game/types';

export const mackogneur: PokemonCard = {
  id: 'mackogneur-001',
  name: 'Mackogneur',
  stage: 'niveau2',
  variant: 'normal',
  type: 'combat',
  maxHp: 160,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/mackogneur-card.png'),
  
  attacks: [
    
    
    {
      name: 'Règlement de Comptes',
      damage: 20,
      energyCost: 2,
      requiredEnergies: { combat: 2,},
script: [
  { action: 'attackDamage', amount: 80,
    per: { count: 'knockedOut', turn: 'last', filter: { isInvocation: false } } },
],
effectText:
  "Cette attaque inflige 80 dégâts supplémentaires pour chacun de vos Pokémon mis K.O. pendant le dernier tour (hors Invocations).",
    },
    {
      name: 'Sacrifice',
      damage: 150,
      energyCost: 3,
      requiredEnergies: { combat: 3,},

      effects: [  {    type: 'recoil',    amount: 30,  },],


      
      effectText:
        'Ce Pokémon s’inflige 30 dégâts.',
    },
  ],
};