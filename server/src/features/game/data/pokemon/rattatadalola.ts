import type { PokemonCard } from '@/features/game/types';

export const rattatadalola: PokemonCard = {
  id: 'rattatadalola-001',          // unique dans tout le jeu
  name: 'Rattata d’Alola',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'obscurite',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 40,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/rattatadalola-card.png'),
  attacks: [
    { name: 'Puissace', damage: 0, energyCost: 1,
      effects: [
  {
    type: 'setNextTurnAttackBaseDamage',
    amount: 60,
    attackName: 'Morsure',
  },
],
effectText:
  "Pendant votre prochain tour, les dégâts de base de Morsure sont de 60.",
    },
    {
      name: 'Morsure',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { obscurite: 1 }, // optionnel : énergies de types précis
    },
  ],
};