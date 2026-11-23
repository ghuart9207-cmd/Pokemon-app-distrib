import type { PokemonCard } from '@/features/game/types';

export const machopeur: PokemonCard = {
  id: 'machopeur-001',
  name: 'Machopeur',
  stage: 'niveau1',
  variant: 'normal',
  type: 'combat',
  maxHp: 100,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/machopeur-card.png'),
  talent: {
  name: 'Attitude Patibulaire',
  type: 'passive',
 effect: 'script',
  description: 'Evitez tous les dégâts infligés à vos Pokémon de Banc.',
  script: [
    { action: 'immunity', against: ['damage'] , target: { side: 'own', who: 'all', filter: { position: 'bench' } }, },
],
},
  attacks: [
    
    {
      name: 'Coup-Croix',
      damage: 30,
      energyCost: 2,

      requiredEnergies: {
        combat: 2,
      },
      coinCount: 1,
 coinDamageEffects: [ {side: 'face',   condition: 'any',    damage: 30,  } ,  ],
effectText:  'Lancez une pièce. Si c’est Face, cette attaque inflige 30 dégâts supplémentaires.' 

    },
      
    ],
};