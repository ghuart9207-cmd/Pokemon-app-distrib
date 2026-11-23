import type { TrainerCard } from '@/features/game/types';

export const skateboard: TrainerCard = {
  id: 'skateboard-001',
  name: 'Skateboard Evasion',
  category: 'objet',
  subtype: 'outil',

   artwork: require('../../../../../assets/images/skateboard-card.png'),

  description:
    "Le coût de retraite du Pokémon auquel cette carte est attachée est diminué de 1 . Il peut battre en retraite même s'il est Paralysé ou Endormi.",

  effect: 'toolRetreatMinusOneIgnoreConditions',

  retreatCostReduction: 1,
};
