import type { PokemonCard } from '@/features/game/types';

export const karaclee: PokemonCard = {
  id: 'karaclee-001',
  name: 'Karaclee',
  stage: 'niveau1',
  variant: 'normal',
  type: 'combat',
  maxHp: 90,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/karaclee-card.png'),
  attacks: [
    {
      name: 'Prévention',
      damage: 0,
      energyCost: 1,
      requiredEnergies: {
        combat: 1,
      },
      blocksNextOwnTurn: true,
      effects: [
    {
      type: 'preventDamageFromStageOrVariantNextOpponentTurn',
      amount: 0,
      blockedStage: 'base',
    },
  ],

  effectText:
    'Évitez tous les dégâts infligés à ce Pokémon par les attaques des Pokémon de Base pendant le prochain tour de votre adversaire. Ce pokémon ne peut pas utiliser prévention pendant votre prochain tour.',
    },
    {
      name: 'Casse Brique',
      damage: 40,
      energyCost: 2,
      requiredEnergies: {
        combat: 1,
      },

      fixedDamage: 30,
      effectText:
        'Les dégâts de cette attaque ne sont pas affectés par aucun effet en action sur le pokémon actif de votre adversaire.',
    },
  ],
};