import type { PokemonCard } from '@/features/game/types';

export const rattatacdalola: PokemonCard = {
  id: 'rattatacdalola-001',          // unique dans tout le jeu
  name: 'Rattatac d’Alola',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'obscurite',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 120,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/rattatadalola-card.png'),
  attacks: [
    { name: 'Puissace', damage: 0, energyCost: 1},
    {
      name: 'Morsure',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { obscurite: 1 }, // optionnel : énergies de types précis
    },
  ],
};