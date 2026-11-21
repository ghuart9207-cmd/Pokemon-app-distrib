import type { PokemonCard } from '@/features/game/types';

export const siderella: PokemonCard = {
  id: 'siderella-001',
  name: 'Sidérella',
  stage: 'niveau2',
  variant: 'normal',
  type: 'psy',
  maxHp: 140,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/siderella-card.png'),
  attacks: [
    
    {
  name: 'Rayon Inversion',
  damage: 0,
  energyCost: 1,
  requiredEnergies: {
    psy: 1,
  },
  script: [
    
    { action: 'switch', target: { side: 'opponent', who: 'active' } },
    
    { action: 'damage', amount: 30, target: { side: 'opponent', who: 'active' } },
  ],
  effectText:
    "Échangez l'un des Pokémon de votre adversaire avec son Pokémon Actif. Cette attaque inflige 30 dégâts au nouveau Pokémon Actif.",
},
    {
      name: 'Explosion en Série',
      damage: 50, 
      energyCost: 2,

      requiredEnergies: {
        psy: 1,
      },
    
  script: [
    { action: 'attackDamage', amount: 80,
      if: { count: 'energy', who: 'self',
            sameAs: { count: 'energy', side: 'opponent', who: 'active' } } },
  ],
  effectText:
    "Si ce Pokémon et le Pokémon Actif de votre adversaire ont le même nombre d'Énergies attachées, cette attaque inflige 80 dégâts supplémentaires.",
},
 

      
    ],
};