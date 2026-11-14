import type { PokemonCard } from '@/features/game/types';

export const rattatacdalola: PokemonCard = {
  id: 'rattatacdalola-001',          // unique dans tout le jeu
  name: 'Rattatac d’Alola',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'obscurite',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 120,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/rattatacdalola-card.png'),
  attacks: [
    { name: 'Croc Amélioré', damage: 10, energyCost: 1,
      effects: [
  {
    type: 'bonusDamageIfToolAttached',
    amount: 50,
  },
],
effectText:
  "Si une carte Outil est attachée à ce Pokémon, cette attaque inflige 50 dégâts supplémentaires.",
    },
    {
      name: 'Croc de Mort',
      damage: 60,
      energyCost: 1,
      requiredEnergies: { obscurite: 1 }, // optionnel : énergies de types précis
      coinCount: 1,
 failsOn: 'pile',
effectText: 'Lancez une pièce. Si c’est Pile, cette attaque ne fait rien.' 
    },
  ],
};