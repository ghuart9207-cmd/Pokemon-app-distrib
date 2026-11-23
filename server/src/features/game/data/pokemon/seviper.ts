import type { PokemonCard } from '@/features/game/types';

export const seviper: PokemonCard = {
  id: 'seviper-001',          // unique dans tout le jeu
  name: 'Séviper',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 100,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/seviper-card.png'),
  talent: {
  name: 'Poison Sans Fin',
  type: 'passive',
  effect: 'increaseOpponentPoisonDamage',
  amount: 10,
  description:
    'Les Pokémon adverses empoisonnés subissent 10 dégâts supplémentaires du poison.',
},
  attacks: [
    
    {
      name: 'Croc Poison',
      damage: 30,
      energyCost: 3,
      requiredEnergies: { psy: 1 }, // optionnel : énergies de types précis
        effects: [
          {
            type: 'poison',
            amount: 1,
          },
        ],
      effectText: 'Le pokémon actif de votre adversaire est maintenant empoisonné.',
    },
  ],
};