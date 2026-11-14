import type { PokemonCard } from '@/features/game/types';

export const tritox: PokemonCard = {
  id: 'tritox-001',
  name: 'Tritox',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tritox-card.png'),
  attacks: [
    {
      name: 'Griffe',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { feu: 1 },
      
    },
    {
      name: 'Choc Venin',
      damage: 20,
      energyCost: 2,

effects: [
  {
    type: 'bonusDamageIfTargetPoisoned',
    amount: 40,
  },
],
effectText:
  "Si le Pokémon actif de votre adversaire est empoisonné, cette attaque inflige 40 dégâts supplémentaires.",

      
    },
  ],
};