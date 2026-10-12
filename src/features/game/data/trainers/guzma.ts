import type { TrainerCard } from '@/features/game/types';

export const guzma: TrainerCard = {
  id: 'guzma-001',
  name: 'Guzma',
  category: 'supporter',
  artwork: require('../../../../../assets/images/guzma-card.png'),
  description:
    'Échangez l’un des Pokémon de votre adversaire avec un autre de ses Pokémon. Ensuite, échangez l’un de vos Pokémon avec un autre de vos Pokémon.',

  effect: 'forceOpponentThenSelfSwitch',
};
