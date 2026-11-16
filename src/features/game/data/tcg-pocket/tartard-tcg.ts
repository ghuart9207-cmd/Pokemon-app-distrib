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
  name: 'Nom du talent',
  type: 'passive',
  effect: 'damageAttackerWhenDamagedWhileActive',
  amount: 20,
  description:
    "Si ce Pokémon est votre Pokémon actif et qu'il subit les dégâts d'une attaque d'un Pokémon de votre adversaire, le Pokémon attaquant subit 20 dégâts.",
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