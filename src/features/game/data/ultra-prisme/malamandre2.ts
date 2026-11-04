import type { PokemonCard } from '@/features/game/types';

export const malamandre2: PokemonCard = {
  id: 'malamandre-002',
  name: 'Malamandre',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 110,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/malamandre2-card.png'),
  
  attacks: [
    
    {
      name: 'Poison Panique',
      damage: 0,
      energyCost: 1,

      requiredEnergies: {
        feu: 1,
      },
       effects: [ { type: 'poison',
      amount: 1, 
    },
    { type: 'confuse',
      amount: 1, 
    },
    { type: 'burn',
      amount: 1, 
    },
],


      effectText:
        'Le pokémon actif de votre adversaire est maintenant Confus, Empoisonné et Brulé.',
    },
    {
      name: 'Lance-Flammes',
      damage: 60,
      energyCost: 3,

      requiredEnergies: {
        feu: 1,
      },
      effects: [
  {
    type: 'bonusDamageIfOpponentActiveHasCondition',
    amount: 60,
    // Facultatif : sans cette ligne, n'importe quel état spécial compte.
    conditions: ['poison','burn','confuse','paralyze','sleep'],
  },
],
effectText: "Si le Pokémon actif de votre adversaire est affecté par un Etat Spécial, cette attaque inflige 60 dégâts supplémentaires.",
    },
      
    ],
};