import type { PokemonCard } from '@/features/game/types';

export const seleroc: PokemonCard = {
  id: 'seleroc-001',          // unique dans tout le jeu
  name: 'Séléroc',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 90,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/seleroc-card.png'),
  attacks: [
    
    {
      name: 'Explosion Lunaire',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { combat: 1 }, // optionnel : énergies de types précis
    },
  ],
};