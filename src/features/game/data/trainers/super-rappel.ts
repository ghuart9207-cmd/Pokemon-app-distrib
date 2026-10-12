import type { TrainerCard } from '@/features/game/types';

export const superRappel: TrainerCard = {
  id: 'rappel-002',
  name: 'Super Rappel',
  category: 'objet',
  artwork: require('../../../../../assets/images/super_rappel-card.png'),
  description:
    'Lancez une pièce. Si c’est Face, choisissez l’un de vos Pokémon en jeu et remettez ce Pokémon ainsi que son Outil Pokémon attaché dans votre main.',

  effect: 'coinReturnPokemonToHand',

  coinCount: 1,
};
