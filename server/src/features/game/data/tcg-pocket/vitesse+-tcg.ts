import type { TrainerCard } from '@/features/game/types';

export const vitesseplustcg: TrainerCard = {
  id: 'vitesseplustcg-001',
  name: 'Vitesse+',
  category: 'objet',
  artwork: require('../../../../../assets/images/vitesseplus-tcg.png'),
  description:
    "Le cout de retrait de votre Pokémon actif est réduit de 1.",
  effect: 'script',
  script: [
  {
  action: 'retreatCost', amount: -1   ,          
      target: { side: 'own', who: 'chosen',  },
}
  ],
};
