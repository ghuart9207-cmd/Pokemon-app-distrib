import type { PokemonCard } from '@/features/game/types';

export const elekable: PokemonCard = {
  id: 'elekable-001',          // unique dans tout le jeu
  name: 'Élekable',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'electrique',           // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 140,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/elekable-card.png'),
  attacks: [
    { name: 'Poing-éclair', damage: 60, energyCost: 3 ,
      requiredEnergies: { electrique: 1 }, 
      coinCount: 1,

  coinDamageEffects: [
    {
      side: 'face',
      condition: 'any',
      damage: 60,
    },
    ],
  coinEffects: [
  {
    side: 'pile',
    condition: 'any',
    effect: {
      type: 'recoil',
      amount: 20,
  },
},
],
    
  effectText:
    'Lancez une pièce. Si c’est Face, cette attaque inflige 60 dégâts supplémentaires. Si c’est Pile, ce pokémon s’inflige 20 dégâts.',


    },
    {
      name: 'Giga Impact',
      damage: 170,
      energyCost: 4,
      
      requiredEnergies: { electrique: 2 }, // optionnel : énergies de types précis
      blocksAllAttacksNextOwnTurn: true,
      effectText:
    'Ce pokémon ne peut pas attaquer pendant votre prochain tour.',

    },
  ],
};