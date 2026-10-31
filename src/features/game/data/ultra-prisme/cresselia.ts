import type { PokemonCard } from '@/features/game/types';

export const cresselia: PokemonCard = {
  id: 'cresselia-001',
  name: 'Cresselia',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 120,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/cresselia-card.png'),
  attacks: [
    
    
    {
      name: 'Vengeance Lunaire',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { psy: 1,},

      effects: [{ type: 'swapDamageCountersWithOpponentActive', amount: 0 }],
effectText: 'Échangez tous les marqueurs de dégâts de ce Pokémon avec ceux du Pokémon Actif de votre adversaire.',
    },
    {
      name: 'Psyko',
      damage: 60,
      energyCost: 3,
      requiredEnergies: { psy: 1,},
      effects: [{ type: 'damagePerOpponentActiveEnergy', amount: 20 }],
effectText: 'Cette attaque inflige 20 dégâts supplémentaires pour chaque Énergie attachée au Pokémon Actif de votre adversaire.',
    },
  ],
};