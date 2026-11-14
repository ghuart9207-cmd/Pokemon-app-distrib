import type { PokemonCard } from '@/features/game/types';

export const venipatte: PokemonCard = {
  id: 'venipatte-001',
  name: 'Venipatte',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 70,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/venipatte-card.png'),
  attacks: [
    {
      name: 'Piqûre',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { psy: 1 },
      
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