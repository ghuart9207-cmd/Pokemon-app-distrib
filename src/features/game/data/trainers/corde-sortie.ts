import type { TrainerCard } from '@/features/game/types';

export const cordeSortie: TrainerCard = {
  id: 'corde_sortie-001',
  name: 'Corde Sortie',
  category: 'objet',
  description:
    "Chaque joueur échange l'un de ses Pokémon avec un autre de ses Pokémon de banc. L'adversaire effectue son échange en premier.",

  effect: 'bothPlayersSwitch',

  artwork: require('../../../../../assets/images/corde-card.png'),
};
