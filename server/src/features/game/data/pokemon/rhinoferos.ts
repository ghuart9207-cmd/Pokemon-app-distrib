import type { PokemonCard } from '@/features/game/types';

export const rhinoferos: PokemonCard = {
  id: 'rhinoferos-001',          // unique dans tout le jeu
  name: 'Rhinoféros',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/rhinoferos-card.png'),
  attacks: [
    { name: 'Allonger', damage: 80, energyCost: 3,
        requiredEnergies: { combat: 3 },
        effects: [
  {
    type: 'ignoreTargetDamageReduction',
    amount: 0,
  },
],
effectText:
  "Les dégâts de cette attaque ne sont pas affecté par la résistance.",

    },
    {
      name: 'Empal’Korn',
      damage: 120,
      energyCost: 4,
      requiredEnergies: { combat: 3 },
      coinCount: 1,
 failsOn: 'pile',
     effectText: 'Lancez une pièce. Si c’est Pile, cette attaque ne fait rien.' 
    },
  ],
};