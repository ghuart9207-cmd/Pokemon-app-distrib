import type { PokemonCard } from '@/features/game/types';

export const laporeille: PokemonCard = {
  id: 'laporeille-001',
  name: 'Laporeille',
  stage: 'base',
  variant: 'normal',
  type: 'normal',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/laporeille-card.png'),
  attacks: [
    
    
    {
      name: 'Genoux Tremblants',
      damage: 0,
      energyCost: 1,
      

     effects: [{ type: 'coinCheckBeforeTargetAttackNextTurn', amount: 1 }],
effectText: "Pendant le prochain tour de votre adversaire, si le Pokémon Défenseur attaque, il lance 1 pièces. Si c'est pile, son attaque ne fait rien.",

    },
    {
      name: 'Sautiller',
      damage: 10,
      energyCost: 1,
      

     
    },
    
  ],
};