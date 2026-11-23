import type { PokemonCard } from '@/features/game/types';

export const predasteriegx: PokemonCard = {
  id: 'predasteriegx-001',
  name: 'Prédastérie GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'psy',
  maxHp: 210,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/predasteriegx-card.png'),
  attacks: [
    {
      name: 'Picanon',
      damage: 0,
      energyCost: 1,
      requiredEnergies: {
        psy: 1,
      },

     coinCount: 4, damagePerFace: 30,
effectText:        'Lancez 4 pièces. Cette attaque inflige 30 dégâts pour chaque côté Face.',

    },
    {
      name: 'Poison Super Intense',
      damage: 0,
      energyCost: 3,
      requiredEnergies: {
        psy: 3,
      },
      script: [
  { action: 'condition', conditions: ['poison'], poisonCounters: 10,
    target: { side: 'opponent', who: 'active' } },
],
effectText:
  "Le Pokémon Actif de votre adversaire est maintenant Empoisonné. Placez 10 marqueurs de dégâts au lieu d'1 sur ce Pokémon entre chaque tour.",
      
    },
  ],
};
