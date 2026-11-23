import type { TrainerCard } from '@/features/game/types';

export const potiontcg: TrainerCard = {
  id: 'potiontcg-001',
  name: 'Potion',
  category: 'objet',
  artwork: require('../../../../../assets/images/potion-card.png'),
  description: 'Soigne 20 dégâts à un de tes Pokémon.',
  effect: 'heal20',
};
