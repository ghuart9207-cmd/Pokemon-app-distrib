import type { PokemonCard } from '@/features/game/types';

export const moufflair: PokemonCard = {
  id: 'moufflair-001',
  name: 'Moufflair',
  stage: 'niveau1',
  variant: 'normal',
  type: 'obscurite',
  maxHp: 120,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/moufflair-card.png'),
  attacks: [
    

    {
      name: 'Brouillard Collant',
      damage: 50,
      energyCost: 2,

      requiredEnergies: {
        obscurite: 1,
      },

      
          effects: [{ type: 'coinCheckBeforeTargetAttackNextTurn', amount: 2 }],
effectText: "Pendant le prochain tour de votre adversaire, si le Pokémon Défenseur attaque, il lance 2 pièces. S'il obtient au moins un côté pile, son attaque ne fait rien.",
    },
    {
      name: 'Enfoncement',
      damage: 100,
      energyCost: 3,
       requiredEnergies: {
        obscurite: 2,
      },
      
    },
  ],
};