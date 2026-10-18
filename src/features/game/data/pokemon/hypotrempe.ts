import type { PokemonCard } from '@/features/game/types';

export const hypotrempe: PokemonCard = {
  id: 'hypotrempe-001',          // unique dans tout le jeu
  name: 'Hypotrempe',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/hypotrempe-card.png'),
  attacks: [
    {
      name: 'Flèche d’eau',
      damage: 10,
        targetMode: 'anyOpponentPokemon',
      energyCost: 1,
      requiredEnergies: { eau: 1 }, 
        

         effectText:
    'Cette attaque inflige 10 dégats à l’un des pokémons de votre adversaire.',
},
],
};