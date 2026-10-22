import type { PokemonCard } from '@/features/game/types';

export const tadmorvdalola: PokemonCard = {
  id: 'tadmorvedalola-001',          // unique dans tout le jeu
  name: 'Tadmorv d’Alola',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'obscurite',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/tadmorvdalola-card.png'),
  attacks: [
    {
      name: 'Division',
      damage: 0,
      energyCost: 1,
    },
    {
      name: 'Gadoue Glissante',
      damage: 0,
      energyCost: 2,
        effects: [
          {
            type: 'confuse',
            amount: 1,
          },
        ],
      effectText: 'Le pokémon actif de votre adversaire est maintenant confus.',
    },
  ],
};