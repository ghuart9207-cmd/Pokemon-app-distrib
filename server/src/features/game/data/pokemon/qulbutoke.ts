import type { PokemonCard } from '@/features/game/types';

export const qulbutoke: PokemonCard = {
  id: 'qulbutoke-001',
  name: 'Qulbutoké',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 120,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/qulbutoke-card.png'),
  attacks: [
    {
      name: 'Noeud Sombre',
      damage: 0,
      energyCost: 3,
      requiredEnergies: {
        psy: 3,
      },
      effects: [
  {
    type: 'bonusDamagePerTargetRetreatCost',
    amount: 50,
  },
],
effectText:
  'Cette attaque inflige 50 dégâts supplémentaires pour chaque Énergie dans le coût de retraite du Pokémon actif de votre adversaire.',
    },
    
  ],
};
