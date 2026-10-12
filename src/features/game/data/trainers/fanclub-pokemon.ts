import type { TrainerCard } from '@/features/game/types';

export const fanclubPokemon: TrainerCard = {
  id: 'fanclubpokemon-001',

  name: 'Fan Club Pokemon',

  category: 'supporter',

  description: 'Invoquez 2 Pokémon de Base ayant 60 PV ou moins sur votre banc.',

  effect: 'summonTwoBase60',

  artwork: require('../../../../../assets/images/fanclubpokemon-card.png'),
};
