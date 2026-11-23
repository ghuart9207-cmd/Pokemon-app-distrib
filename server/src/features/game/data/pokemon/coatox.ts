import type { PokemonCard } from '@/features/game/types';

export const coatox: PokemonCard = {
  id: 'coatox-001',          // unique dans tout le jeu
  name: 'Coatox',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/coatox-card.png'),
  attacks: [
    
    {
      name: 'Direct Toxik',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { psy: 1 }, // optionnel : énergies de types précis
        effects: [
          {
            type: 'poison',
            amount: 1,
          },
        ],
      effectText: 'Le pokémon actif de votre adversaire est maintenant empoisonné.',
    },
    {
      name: 'Boost de Poison',
      damage: 80,
      energyCost: 3,
      requiredEnergies: { psy: 2 }, // optionnel : énergies de types précis
        
effects: [
  {
    type: 'bonusDamageIfTargetPoisoned',
    amount: 80,
  },
],
effectText:
  "Si le Pokémon actif de votre adversaire est empoisonné, cette attaque inflige 80 dégâts supplémentaires.",

    },
  ],
}