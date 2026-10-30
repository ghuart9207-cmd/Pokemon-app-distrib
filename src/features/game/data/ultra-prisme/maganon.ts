import type { PokemonCard } from '@/features/game/types';

export const maganon: PokemonCard = {
  id: 'maganon-001',
  name: 'Maganon',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 130,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/maganon-card.png'),
  talent: {
  name: 'Corps Incandescent',
  type: 'passive',
  effect: 'burnAttackerWhenDamagedWhileActive',
  description:
    "Si ce Pokémon est votre Pokémon actif et qu'il subit les dégâts d'une attaque de votre adversaire, le Pokémon attaquant est maintenant Brûlé.",
},
  attacks: [
    
    {
      name: 'Explosif Enflammé',
      damage: 80,
      energyCost: 3,

      requiredEnergies: {
        feu: 2,
      },
      effects: [
  { type: 'discardEnergy', amount: 2, optional: true },
  { type: 'bonusDamage', amount: 80 },
],
effectText: 'Vous pouvez défausser 2 Énergies de ce Pokémon. Dans ce cas, cette attaque inflige 80 dégâts supplémentaires.',
    },
  ],
};
