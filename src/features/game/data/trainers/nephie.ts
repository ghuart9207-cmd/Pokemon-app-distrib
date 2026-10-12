import type { TrainerCard } from '@/features/game/types';

export const nephie: TrainerCard = {
  id: 'nephie-001',
  name: 'Néphie',
  category: 'supporter',
  artwork: require('../../../../../assets/images/nephie-card.png'),
  description:
    'Soignez 50 dégâts à chacun de vos Pokémon auxquels est attachée au moins 1 Énergie Eau.',

  effect: 'healWaterEnergy50',
};
