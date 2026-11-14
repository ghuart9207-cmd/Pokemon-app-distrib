import type { PokemonCard } from '@/features/game/types';

export const archeodong: PokemonCard = {
  id: 'archeodong-001',
  name: 'Archéodong',
  stage: 'niveau1',
  variant: 'normal',
  type: 'metal',
  maxHp: 110,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/archeodong-card.png'),
  attacks: [
    
    
    {
      name: 'Choc Mental',
      damage: 20,
      energyCost: 1,
      requiredEnergies: { metal: 1,},

      
      effects: [ { type: 'paralyze',      amount: 1, },],


      
      effectText:
        'Le Pokémon actif de votre adversaire est maintenant paralysé.',
    },
    {
      name: 'Résonance Psychique',
      damage: 60,
      energyCost: 3,
   requiredEnergies: { metal: 1,},
effects: [
  { type: 'bonusDamageIfOpponentHasTypeInPlay', amount: 60, pokemonType: 'psy' },
],
effectText: 'Si votre adversaire a un Pokémon Psy en jeu, cette attaque inflige 60 dégâts supplémentaires.',
    },
  ],
};