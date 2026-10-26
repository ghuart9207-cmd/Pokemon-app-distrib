import type { PokemonCard } from '@/features/game/types';

export const sorbouboul: PokemonCard = {
  id: 'sorbouboul-001',
  name: 'Sorbouboul',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 140,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/sorbouboul-card.png'),
  attacks: [
    
    {
      name: 'Grele',
      damage: 0, 
      energyCost: 1,

      requiredEnergies: {
        eau: 1,
      },
     effects: [{ type: 'damageAllOpponentPokemonAndPlayer', amount: 20 }],
  effectText:
    'Cette attaque inflige 20 dégats à chacun des Pokémon de votre adversaire.',
    },
    {
      name: 'Souffle Gelé',
      damage: 80, 
      energyCost: 3,

      requiredEnergies: {
        eau: 3,
      },
     effects: [{      type: 'discardTypedEnergy',      amount: 2,      energyType: 'eau', optional: true,     }, { type: 'paralyze',      amount: 1, },  ],
  effectText:
    'Vous pouvez défausser 2 Energies Eau attachées à ce Pokémon. Dans ce cas, le Pokémon Actif de votre adversaire est maintenant Paralysé.',
    },
      
    ],
};