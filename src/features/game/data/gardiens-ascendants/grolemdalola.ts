import type { PokemonCard } from '@/features/game/types';

export const grolemdalola: PokemonCard = {
  id: 'grolemdalola-001',
  name: 'Grolem d’Alola',
  stage: 'niveau2',
  variant: 'normal',
  type: 'electrique',
  maxHp: 160,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/grolemdalola-card.png'),
  attacks: [
    
    
    {
      name: 'Roc-Boulet Electromagnétique',
      damage: 0,
      energyCost: 3,
      requiredEnergies: { electrique: 1,  },
     
 coinCountPerAttachedEnergy: 'electrique',
  damagePerFace: 80,
  effectText:
    'Lancez une pièce pour chaque Énergie Électrique attachée à ce Pokémon. Cette attaque inflige 80 dégâts pour chaque côté face.',
 
    },
    {
      name: 'Tacle Lourd',
      damage: 200,
      energyCost: 4,
     requiredEnergies: { electrique: 1},
 effects: [{ type: 'reduceDamagePerTargetRetreatCost', amount: 30 }],
  effectText:
    "Cette attaque inflige 30 dégâts de moins pour chaque Énergie dans le coût de Retraite du Pokémon Actif de votre adversaire.",
    },
  ],
};