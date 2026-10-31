import type { PokemonCard } from '@/features/game/types';

export const charkos: PokemonCard = {
  id: 'charkos-001',
  name: 'Charkos',
  stage: 'niveau2',
  variant: 'normal',
  type: 'combat',
  maxHp: 150,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/charkos-card.png'),
  attacks: [
    {
      name: 'Coup Net',
      damage: 60,
      energyCost: 1,
      requiredEnergies: {
        combat: 1,
      },

      bonusDamageIfTargetEvolved: 60,

      effectText:
        'Si le Pokémon actif de votre adversaire est un Pokémon évolutif, cette attaque inflige 60 dégâts supplémentaires.',
    },
    {
      name: 'Collision Agitée',
      damage: 0,
      energyCost: 3,
      requiredEnergies: {
        combat: 3,
      },
      effects: [{ type: 'knockOutIfOpponentActiveIsBase', amount: 0 }],
effectText: "Si le Pokémon Actif de votre adversaire est un Pokémon de Base, il est mis K.O.",
    },
  ],
};