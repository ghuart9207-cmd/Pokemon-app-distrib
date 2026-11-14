import type { PokemonCard } from '@/features/game/types';

export const salameche: PokemonCard = {
  id: 'salameche-001',          // unique dans tout le jeu
  name: 'Salamèche',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'feu',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/salameche-card.png'),
  attacks: [
    { name: 'Griffe', damage: 10, energyCost: 1 },
    {
      name: 'Queue de Flamme',
      damage: 20,
      energyCost: 2,
      requiredEnergies: { feu: 1 }, // optionnel : énergies de types précis
    },
  ],
};