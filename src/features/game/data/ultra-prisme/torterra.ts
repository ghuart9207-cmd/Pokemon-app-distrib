import type { PokemonCard } from '@/features/game/types';

export const torterra : PokemonCard = {
  id: 'torterra-001',          // unique dans tout le jeu
  name: 'Torterra',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 180,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/torterra-card.png'),
  attacks: [
    { name: 'Giga-Sangsue', 
        damage: 50, energyCost: 3 ,
        requiredEnergies: { plante: 2 }, 
       effects: [    {      type: 'healSelfByDamageDealt',      amount: 0,    },  ],
  effectText:    'Soignez à ce Pokémon la même quantité de dégâts que cette attaque a infligée au Pokémon actif de votre adversaire.',

    },
    {
      name: 'Séisme',
      damage: 180,
      energyCost: 4,
      requiredEnergies: { plante: 3 }, 
       ownBenchDamage: 20,
 effectText: 'Cette attaque inflige 20 dégats à chacun de vos Pokémons de Banc.',
    },
  ],
};