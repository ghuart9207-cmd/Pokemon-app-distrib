import type { TrainerCard } from '@/features/game/types';

export const ondinetcg: TrainerCard = {
  id: 'ondinetcg-001',
  name: 'Ondine',
  category: 'supporter',
   artwork: require('../../../../../assets/images/ondine-tcg.png'),

  description:
    "Lancez une pièce, si c'est une face, attaché une Energie Eau à l'un de vos Pokémon Eau.",

  effect: 'script',
  script: [
  {
  action: 'attachEnergy', amount: 1, energyType: 'eau',            
      target: { side: 'own', who: 'chosen', filter: { pokemonTypes: ['eau'] } },
      coin: { count: 1 }
}
  ],
};