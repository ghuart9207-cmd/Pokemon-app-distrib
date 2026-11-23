import type { PokemonCard } from '@/features/game/types';

export const lougaroc2: PokemonCard = {
  id: 'lougaroc-002',          // unique dans tout le jeu
  name: 'Lougaroc',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'combat',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/lougaroc2-card.png'),
  attacks: [
    { name: 'Griffes Redoutables', damage: 30, energyCost: 1,requiredEnergies: { combat: 1 },
bonusDamageIfTargetNotEvolved: 30,
effectText: 'Si le pokémon actif de votre adversaire est un pokémon de base, cette attaque inflige 30 dégats supplémentaires.' 
},
    {
      name: 'Coinçage',
      damage: 90,
      energyCost: 3,
      requiredEnergies: { combat: 1 }, // optionnel : énergies de types précis
    },
  ],
};