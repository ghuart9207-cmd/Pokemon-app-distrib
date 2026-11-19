import type { TrainerCard } from '@/features/game/types';

export const pokeballtcg: TrainerCard = {
  id: 'pokeballtcg-001',
  name: 'Pokeball',
  category: 'objet',
  artwork: require('../../../../../assets/images/pokeball-tcg.png'),
  description:
    "Invoquez un Pokémon de base de 70 pv ou moins sur votre banc (il arrivera sans énergies et ne pourras pas etre ciblé par les cartes dresseurs).",
  effect: 'script',
script: [
  {
    action: 'summon',
    pokemon: { maxHp: 70 },
    target: { side: 'own', count: 1, },
  },
],
  
};