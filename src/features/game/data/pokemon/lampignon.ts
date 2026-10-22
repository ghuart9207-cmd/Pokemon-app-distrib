import type { PokemonCard } from '@/features/game/types';

export const lampignon: PokemonCard = {
  id: 'lampignon-001',          // unique dans tout le jeu
  name: 'Lampignon',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 100,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/lampignon-card.png'),
  attacks: [
    { name: 'Vol-Force', damage: 30, energyCost: 2,requiredEnergies: { fee: 1 },
  effects: [
  {
    type: 'healSelfPerOpponentActiveEnergy',
    amount: 30,
  },
],
effectText:
  "Soignez 30 dégâts à ce Pokémon pour chaque Énergie attachée au Pokémon actif de votre adversaire.",
  },
    {
      name: 'Pouls Dodo',
      damage: 60,
      energyCost: 3,
      requiredEnergies: { fee: 1 }, // optionnel : énergies de types précis
          effects: [ { type: 'sleep',
      amount: 1, },],

effectText: 'Le Pokémon actif de votre adversaire est maintenant Endormi.' 

    },
  ],
};