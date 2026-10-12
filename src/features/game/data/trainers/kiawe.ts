import type { TrainerCard } from '@/features/game/types';

export const kiawe: TrainerCard = {
  id: 'kiawe-001',
  name: 'Kiawe',
  category: 'supporter',
  artwork: require('../../../../../assets/images/kiawe-card.png'),
  description:
    'Ajoutez 2 Énergies Feu à l’un de vos Pokémon de type Feu. Votre tour se termine.',

  effect: 'attach2FireEndTurn',
};
