import type { PokemonCard } from '@/features/game/types';

export const kirlia: PokemonCard = {
  id: 'kirlia-001',          // unique dans tout le jeu
  name: 'Kirlia',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/kirlia-card.png'),
  attacks: [
    { name: 'Claque', damage: 20, energyCost: 1},
    {
      name: 'Coup Magique',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { fee: 1 }, // optionnel : énergies de types précis
    },
  ],
};