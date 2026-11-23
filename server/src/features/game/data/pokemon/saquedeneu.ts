import type { PokemonCard } from '@/features/game/types';

export const saquedeneu: PokemonCard = {
  id: 'saquedeneu-001',          // unique dans tout le jeu
  name: 'Saquedeneu',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/saquedeneu-card.png'),
  attacks: [
    {
      name: 'Astreinte',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { plante: 1 }, 
        effects: [
    {
      type: 'preventTargetRetreatNextTurn',
      amount: 0,
    },
  ],

  effectText:
    'Le Pokémon Défenseur ne peut pas battre en retraite pendant le prochain tour de votre adversaire.',
},
],
};