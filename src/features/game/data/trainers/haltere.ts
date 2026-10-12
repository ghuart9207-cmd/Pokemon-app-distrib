import type { TrainerCard } from '@/features/game/types';

export const haltere: TrainerCard = {
  id: 'haltère-001',
  name: 'Haltères de Culturisme',
  category: 'objet',
  subtype: 'outil',

  artwork: require('../../../../../assets/images/haltere-card.png'),

  description:
    'Attachez cette carte à un Pokémon de Niveau 1. Ce Pokémon gagne 40 PV maximum.',

  effect: 'toolHp40',
};
