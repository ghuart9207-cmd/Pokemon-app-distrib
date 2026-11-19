import type { PokemonCard } from '@/features/game/types';

export const raichu: PokemonCard = {
  id: 'raichu-001',          // unique dans tout le jeu
  name: 'Raichu',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'electrique',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/raichu-card.png'),
  
  talent: {
    name: 'Choc Evolutif',
    type: 'passive',
    effect: 'applyConditionsToOpponentOnPlay',
  conditions: ['paralyze'],
  description:
    "Lorsque vous posez ce Pokémon sur le plateau, le Pokémon actif de votre adversaire est maintenant Paralysé.",
  },
  attacks: [
    
    {
      name: 'Electacle',
      damage: 130,
      energyCost: 3,
      
effects: [
  {
    type: 'recoil',
    amount: 30,
  },
],

      requiredEnergies: { electrique: 2 }, // optionnel : énergies de types précis
         effectText:
    'Ce pokémon s’inflige 30 dégâts.',

    },
  ],

};