import type { PokemonCard } from '@/features/game/types';

export const lougarocgx: PokemonCard = {
  id: 'lougarocgx-001',          // unique dans tout le jeu
  name: 'Lougaroc GX',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 200,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/lougarocgx-card.png'),
  attacks: [
    { name: 'Machouille', damage: 30, energyCost: 2,requiredEnergies: { combat: 1 },
effects: [
  {
    type: 'discardOpponentActiveEnergy',
    amount: 1,
  },
],
effectText:
  "Défaussez une Énergie du Pokémon Actif de votre adversaire.",
},
    {
      name: 'Vif Roc',
      damage: 120,
      energyCost: 3,
      requiredEnergies: { combat: 2 }, // optionnel : énergies de types précis
    },
  ],
};