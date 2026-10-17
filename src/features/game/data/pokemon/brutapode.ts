import type { PokemonCard } from '@/features/game/types';

export const brutapode: PokemonCard = {
  id: 'brutapode-001',          // unique dans tout le jeu
  name: 'Brutapode',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 160,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/brutapode-card.png'),
  attacks: [
    
    {
      name: 'Corne Empoisonnée',
      damage: 80,
      energyCost: 3,
      requiredEnergies: { psy: 2 }, // optionnel : énergies de types précis
        effects: [
          {
            type: 'poison',
            amount: 1,
          },
        ],
      effectText: 'Le pokémon actif de votre adversaire est maintenant empoisonné.',
    },
    {
      name: 'Buldoboule',
      damage: 140,
      energyCost: 4,
      requiredEnergies: { psy: 3 }, 
    },
  ],
};