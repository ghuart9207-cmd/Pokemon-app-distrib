import type { PokemonCard } from '@/features/game/types';

export const ortide: PokemonCard = {
  id: 'ortide-001',          // unique dans tout le jeu
  name: 'ortide',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/ortide-card.png'),
  attacks: [
    { name: 'Parfum Nauséabond', damage: 0, energyCost: 1, requiredEnergies: { plante: 1 },
   effects: [
          {
            type: 'confuse',
            amount: 1,
          },
        ],
        effectText: 'Le pokémon actif de votre adversaire est maintenant confus.',
},
    {
      name: 'Tranch’Herbe',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { plante: 1 }, // optionnel : énergies de types précis
    },
  ],
};