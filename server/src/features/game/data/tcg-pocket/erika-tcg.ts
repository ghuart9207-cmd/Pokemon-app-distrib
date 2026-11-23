import type { TrainerCard } from '@/features/game/types';

export const erikatcg: TrainerCard = {
  id: 'erikatcg-001',
  name: 'Erika',
  category: 'supporter',
   artwork: require('../../../../../assets/images/erika-tcg.png'),

  description:
    "Soignez 50 dégâts à l'un de vos Pokémon de type Plante.",

  effect: 'script',
  script: [
  {
  action: 'heal',          
  amount: 50,              
      target: { side: 'own', who: 'chosen', filter: { pokemonTypes: ['plante'] } },
}
  ],
};
