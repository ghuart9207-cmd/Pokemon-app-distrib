import type { PokemonCard } from '@/features/game/types';

export const tartardtcg: PokemonCard = {
  id: 'tartardtcg-001',
  name: 'Tartard',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 150,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/tartard-tcg.png'),
  talent: {
  name: 'Contre-Attaque',
  type: 'passive',
  effect: 'script', description: 'Si ce pokémon est sur le poste actif et subit des dégâts, le pokémon attaquant subit 20 dégâts.', script: [
  { action: 'whenDamaged', target: { who: 'self', filter: { position: 'active' } },
    script: [ { action: 'damage',amount: 20 , target: { who: 'attacker' } } ] },
  ],
},
  attacks: [
   {
      name: 'Ultimapoing',
      damage: 80,
      energyCost: 3,
      requiredEnergies: {
        eau: 1,
      },

    },
    
  ],
};