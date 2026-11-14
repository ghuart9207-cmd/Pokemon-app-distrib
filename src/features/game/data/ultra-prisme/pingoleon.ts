import type { PokemonCard } from '@/features/game/types';

export const pingoleon: PokemonCard = {
  id: 'pingoleon-001',
  name: 'Pingoleon',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 160,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/pingoleon-card.png'),
  attacks: [
    
    {
      name: 'Commande Totale',
      damage: 0, 
      energyCost: 2,

      requiredEnergies: {
        eau: 1,
      },
     effects: [{ type: 'damagePerAllBenchPokemon', amount: 20 }],
  effectText:
    "Cette attaque inflige 20 dégâts pour chaque Pokémon de Banc (les vôtres et ceux de votre adversaire).",
    },
    {
      name: 'Siphon',
      damage: 90, 
      energyCost: 3,

      requiredEnergies: {
        eau: 2,
      },
     effects: [  {    type: 'discardOpponentActiveEnergy',    amount: 1,  },],
effectText:  "Défaussez une Énergie du Pokémon Actif de votre adversaire.",

    },
      
    ],
};