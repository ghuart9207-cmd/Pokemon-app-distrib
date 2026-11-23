import type { TrainerCard } from '@/features/game/types';

export const bandeauchoix: TrainerCard = {
  id: 'bandeauchoix-001',
  name: 'Bandeau Choix',
  category: 'objet',
  subtype: 'outil',
  artwork: require('../../../../../assets/images/bandeauchoix-card.png'),
  description: 'Les attaques du Pokémon auquel cette carte est attachée infligent 30 dégâts supplémentaires au Pokémon GX ou au Pokémon EX de votre adversaire.',
  effect: 'script',
  script: [
  {
   action: 'boost', amount: 30,       
                
      vs: { variants: ['gx', 'ex'] }, target: { who: 'self' } },],

};