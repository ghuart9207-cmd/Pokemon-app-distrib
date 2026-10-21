import type { TrainerCard } from '@/features/game/types';

export const superRappel: TrainerCard = {
  id: 'rappel-002',
  name: 'Super Rappel',
  category: 'objet',
  artwork: require('../../../../../assets/images/super_rappel-card.png'),
  description:
    'Lancez une pièce. Si c’est Face, choisissez l’un de vos Pokémon en jeu et remettez ce Pokémon ainsi que son Outil Pokémon attaché dans votre main, mais sans énergie.',

  effect: 'coinReturnPokemonToHand',

  coinCount: 1,

  // Le Pokémon peut être reposé en plus de la pose du tour, sans Énergie.
  returnToHandReplacement: 'free',
};
