import type { PokemonCard } from '@/features/game/types';

export const mystherbe: PokemonCard = {
  id: 'mystherbe-001',          // unique dans tout le jeu
  name: 'Mystherbe',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 50,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/mystherbe-card.png'),
  attacks: [
    
    {
      name: 'Poudre Toxik',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { plante: 1 }, // optionnel : énergies de types précis
        effects: [
          {
            type: 'poison',
            amount: 1,
          },
        ],
      effectText: 'Le pokémon actif de votre adversaire est maintenant empoisonné.',
    },
  ],
};