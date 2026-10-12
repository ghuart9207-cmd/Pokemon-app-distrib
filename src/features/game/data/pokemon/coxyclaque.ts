import type { PokemonCard } from '@/features/game/types';

export const coxyclaque: PokemonCard = {
  id: 'coxyclaque-001',
  name: 'Coxyclaque',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/coxyclaque-card.png'),
  attacks: [
    {
      name: 'Météores',
      damage: 30,
      energyCost: 1,
      requiredEnergies: {
        plante: 1,
      },

      fixedDamage: 30,
      effectText:
        'Les dégâts de cette attaque ne sont pas affectés par aucun effet en action sur le pokémon actif de votre adversaire.',
    },

    {
      name: 'Poing Comète',

      damage: 0,

      energyCost: 3,

      coinCount: 4,

      damagePerFace: 40,

      effectText:
        'Lancez 4 pièces. Cette attaque inflige 40 dégâts pour chaque côté Face.',
    },
  ],
};
