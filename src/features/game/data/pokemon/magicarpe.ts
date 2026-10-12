import type { PokemonCard } from '@/features/game/types';

export const magicarpe: PokemonCard = {
  id: 'magicarpe-001',          // unique dans tout le jeu
  name: 'Magicarpe',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 30,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/magicarpe-card.png'),
  attacks: [
    {
      name: 'Esquive Eclaboussante',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { eau: 1 }, 
        coinCount: 1,

  coinEffects: [
    {
      side: 'face',
      effect: {
        type: 'preventAllAttackDamageAndEffectsNextOpponentTurn',
        amount: 1,
      },
    },
],
         effectText:
    'Lancez une pièce. Si c’est Face, évitez tous les effets d’attaques y compris les dégâts infligés à ce Pokémon pendant le prochain tour de votre adversaire.',
},
],
};