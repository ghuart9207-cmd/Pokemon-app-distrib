import type { PokemonCard } from '@/features/game/types';

export const tiplouf: PokemonCard = {
  id: 'tiplouf-001',          // unique dans tout le jeu
  name: 'Tiplouf',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tiplouf-card.png'),
  attacks: [
    {
      name: 'Crépitement',
      damage: 20,
        targetMode: 'anyOpponentPokemon',
      energyCost: 1,
      requiredEnergies: { eau: 1 }, 
        

         effectText:
    'Cette attaque inflige 20 dégats à l’un des pokémons de votre adversaire.',
},
],
};