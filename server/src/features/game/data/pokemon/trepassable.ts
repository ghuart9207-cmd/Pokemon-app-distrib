import type { PokemonCard } from '@/features/game/types';

export const trepassable: PokemonCard = {
  id: 'trepassable-001',          // unique dans tout le jeu
  name: 'Trépassable',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 130,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/trepassable-card.png'),
  attacks: [
    
    {
      name: 'Tourbi-Sable',
      damage: 80,
      energyCost: 3,
      requiredEnergies: { psy: 1 }, // optionnel : énergies de types précis
        effects: [ {      type: 'preventTargetRetreatNextTurn',      amount: 0,    },  ],
effectText:    'Le Pokémon Défenseur ne peut pas battre en retraite pendant le prochain tour de votre adversaire.',

    },
    {
      name: 'Tempete de Poussière',
      damage: 100,
      energyCost: 4,
      effects: [
  {
    type: 'discardAllEnergyAndToolsFromBothActives',
    amount: 0,
  },
],
effectText:
  "Défaussez toutes les Énergies et cartes Outil attachées au 2 Pokémons Actifs.",
    },
  ],
};