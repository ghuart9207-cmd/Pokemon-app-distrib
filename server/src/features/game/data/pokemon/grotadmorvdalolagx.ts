import type { PokemonCard } from '@/features/game/types';

export const grotadmorvdalolagx: PokemonCard = {
  id: 'grotadmorvdalolagx-001',
  name: 'Grotadmorv d’Alola GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'obscurite',
  maxHp: 220,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/grotadmorvdalolagx-card.png'),
  attacks: [
    {
      name: 'Souffle Chimique',
      damage: 10,
      energyCost: 3,

      requiredEnergies: { obscurite: 1,},
      effects: [
  {
    type: 'bonusDamagePerOpponentActiveSpecialCondition',
    amount: 70,
  },
],
effectText:
  "Cette attaque inflige 70 dégâts supplémentaires pour chaque état spécial affectant le Pokémon actif de votre adversaire.",
    },
    {
      name: 'Machouille',
      damage: 120,
      energyCost: 4,
      requiredEnergies: { obscurite: 1,},
      effects: [  {    type: 'discardOpponentActiveEnergy',    amount: 1,  },],
effectText:  "Défaussez une Énergie du Pokémon Actif de votre adversaire.",

    },
  ],
};