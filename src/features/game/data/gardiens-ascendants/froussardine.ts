import type { PokemonCard } from '@/features/game/types';

export const froussardine: PokemonCard = {
  id: 'froussardine-001',          // unique dans tout le jeu
  name: 'Froussardine GX',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 30,
  retreatCost: 0,
  artwork: require('../../../../../assets/images/froussardine-card.png'),
  talent: {
  name: 'Bnac',
  type: 'activated',
  effect: 'swapWithCardFromHand',
  swapCardId: 'froussardinegx-001',
  description:
    "Pendant votre tour, vous pouvez échanger ce Pokémon avec un Froussardine-GX de votre main. Les cartes attachées, les Énergies, les marqueurs de dégâts, et tous les autres effets restent sur le nouveau Pokémon.",
},
  attacks: [
    {
      name: 'Tir de Précision',
      damage: 10,
        targetMode: 'anyOpponentPokemon',
      energyCost: 1,
      requiredEnergies: { eau: 1 }, 
        

         effectText:
    'Cette attaque inflige 10 dégats à l’un des pokémons de votre adversaire.',
},
],
};