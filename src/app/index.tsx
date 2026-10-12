import { useState } from 'react';
import {
  Button,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type Player = 1 | 2;

type CoinSide = 'face' | 'pile';

type CoinHistory = Partial<
  Record<number, CoinSide[]>
>;

type CoinConstraintQueues = Partial<
  Record<number, CoinSide[][]>
>;

type SetupPhase =
  | 'player1'
  | 'player2'
  | 'battle';

type PokemonTalent = {
  name: string;

  type:
    | 'passive'
    | 'activated';

  effect:
    | 'blockBaseAttacks'
    | 'preventDamageFromType'
    | 'damageOpponentOnPlay' 
    | 'surviveKOOnCoin'
    | 'preventAllEffectsFromExGx';

  blockedType?: EnergyType;

  amount?: number;

  description: string;
};

type PendingKOSurvival = {
  cellName: string;

  player: Player;
};

type PendingGeneratedBenchEnergy = {
  player: Player;

  attackerCell: string;

  energyType: EnergyType;

  amount: number;
};

type PendingOpponentTargetMode =
  | 'anyOpponentPokemon'
  | 'damagedOpponentOrPlayer'
  | 'benchOrPlayer';

type PendingCoinReturnToHand = {
  player: Player;
};

type PendingOpponentActiveSwitch = {
  player: Player;

  activeCell: string;
};

type PendingKOEnergyMove = {
  player: Player;

  sourcePokemonName: string;

  availableEnergies: EnergyType[];

  selectedEnergy:
    EnergyType | null;
};

type PendingOpponentTarget = {
  player: Player;

  attackerCell: string;

  damage: number;

  mode: PendingOpponentTargetMode;

  excludedCell?: string | null;
};

type PendingBothPlayersSwitch = {
  card: TrainerCard;

  // Joueur qui a joué la carte
  playedBy: Player;

  // Propriétaire des Pokémon
  // actuellement à échanger
  choosingPlayer: Player;

  // Joueur qui décide réellement
  // quels Pokémon sont choisis
  controlledBy: Player;

  firstCell: string | null;
};

type CoinFlipResolution = {
  result: CoinSide[] | null;
  choiceAllowed: boolean;
  consumeTrainerConstraint: boolean;
  reason:
    | 'free'
    | 'history'
    | 'trainer';
};

type PendingBenchEnergyAttachment = {
  player: Player;
  attackerCell: string;
  energyType: EnergyType;
  amount: number;
};

type PendingCoinFlip = {
  sourceType: 'pokemon' | 'trainer';
  sourceKey: string;
  sourceName: string;
  player: Player;
  coinCount: number;
  resolution: CoinFlipResolution;
};

type CoinAttackReference = {
  cellName: string;
  attackIndex: number;
  coinResult?: CoinSide[];
};

type Stage =
  | 'base'
  | 'niveau1'
  | 'niveau2'
  | 'mega_ex';

type CardVariant =
  | 'normal'
  | 'ex'
  | 'gx';

type EnergyType =
  | 'electrique'
  | 'feu'
  | 'eau'
  | 'plante'
  | 'psy'
  | 'combat'
  | 'normal'
  | 'obscurite'
  | 'metal'
  | 'fee';

type CoinCondition =
  | 'any'
  | 'all'
  | 'exact';

type CoinConditionalEffect = {
  side: CoinSide;

  condition?: CoinCondition;

  count?: number;

  effect: AttackEffect;
};

type CoinConditionalDamage = {
  side: CoinSide;

  condition?: CoinCondition;

  count?: number;

  damage: number;
};

type AttackEffect = {
  type:
    | 'heal'
    | 'discardEnergy'
    | 'recoverEnergy'
    | 'recoverEnergyToBench'
    | 'switchWithBench'
    | 'discardTypedEnergy'
    | 'recoil'
    | 'poison'
    | 'burn'
    | 'paralyze'
    | 'confuse'
    | 'sleep'
    | 'discardAllTypedEnergyForBonus'
    | 'reduceDamageNextOpponentTurn'
    |'takeExtraDamageNextTurn' 
    | 'healAllOwnAndReturnSelf' 
    | 'healSelfByDamageDealt'
    | 'forceOpponentActiveSwitch'
    | 'attachEnergyToBench';

  amount: number;

  energyType?: EnergyType;
};

type Attack = {
  name: string;
  damage: number;
  energyCost: number;

  requiredEnergies?: Partial<
    Record<EnergyType, number>
  >;

  effects?: AttackEffect[];

  effectText?: string;

  bonusDamageEveryTwoRounds?: number;

  coinCount?: number;

  coinEffects?: CoinConditionalEffect[];

  coinDamageEffects?: CoinConditionalDamage[];

  damagePerFace?: number;
  damagePerPile?: number;

  bonusDamagePerOpponentBenchPokemon?:
  number;

  benchDamageSameTypeAsTarget?: number;

  blocksNextOwnTurn?: boolean;

  fixedDamage?: number;

  failsOn?: CoinSide;

  targetMode?:
  | 'normal'
  | 'anyOpponentPokemon'
  | 'damagedOpponentOrPlayer';

secondaryBenchOrPlayerDamage?: number;

bonusDamageIfSwitchedRecently?: number;

  bonusDamageIfTargetEvolved?: number;
};

type PendingSleepResolution = {
  sourceCell: string;
  targetCell: string;
  sourcePlayer: Player;
};

type PokemonCard = {
  id: string;
  name: string;
  stage: Stage;
  variant: CardVariant;
  type: EnergyType;
  maxHp: number;
  retreatCost: number;
  attacks: Attack[];
  artwork?: any;
  talent?: PokemonTalent;
};

type AttackPath = string[];

type TrainerCard = {
  id: string;
  name: string;
  category: 'objet' | 'supporter';
   subtype?: 'normal' | 'outil';
  description: string;
  effect: 
  | 'heal30' 
  | 'heal20' 
  | 'none' 
  | 'toolHp40'
  | 'returnPokemonToHand' 
  | 'bothPlayersSwitch' 
  | 'healWaterEnergy50' 
  | 'attach2FireEndTurn'
  | 'forceOpponentThenSelfSwitch'
  | 'moveEnergyOnKO'
  | 'coinReturnPokemonToHand'
  | 'summonTwoBase60';

  coinCount?: number;

  artwork?: any;
};

type PlayerStatusState = {
  poisoned: boolean;
  poisonSourcePlayer: Player | null;

  burned: boolean;
  burnSourcePlayer: Player | null;
  burnTriggersRemaining: number;

  extraDamageNextTurn?: number;

extraDamageNextTurnSourcePlayer?:
  Player | null;

extraDamageNextTurnReady?: boolean;
};

function createNormalPlayerStatus(): PlayerStatusState {
  return {
    poisoned: false,
    poisonSourcePlayer: null,

    burned: false,
    burnSourcePlayer: null,
    burnTriggersRemaining: 0,
  };
}

type GameCard = PokemonCard | TrainerCard;

type PokemonInPlay = {
  card: PokemonCard;
  owner: Player;
  currentHp: number;
  energies: EnergyType[];
  attachedTool: TrainerCard | null;
  hasAttacked: boolean;
  hasRetreated: boolean;
  isInvocation?: boolean;

  lastSwitchedTurnId?: number;

  poisoned: boolean;
poisonSourcePlayer: Player | null;

burned: boolean;
burnSourcePlayer: Player | null;
burnTriggersRemaining: number;
paralyzed: boolean;
paralysisTurnsRemaining: number;

confused: boolean;
confusionTurnsRemaining: number;

asleep: boolean;
sleepSourcePlayer: Player | null;
sleepEndPlayer: Player | null;

coinHistory: CoinHistory;

extraDamageNextTurn?: number;

extraDamageNextTurnSourcePlayer?:
  Player | null;

extraDamageNextTurnReady?: boolean;

blockedAttackName?: string | null;
blockedAttackTurnId?: number | null;

attackDamageReduction?: number;

attackDamageReductionEndPlayer?:
  Player | null;
};

type PendingInvocationPlacement = {
  player: Player;

  cards: PokemonCard[];

  selectedIndex:
    number | null;

  supporter: TrainerCard;
};

type BoardState = Record<string, PokemonInPlay | null>;

type PendingPokemonSwitch = {
  player: Player;
  attackerCell: string;
};


const pikachu: PokemonCard = {
  id: 'pikachu-001',
  name: 'Pikachu',
  stage: 'base',
  variant: 'normal',
  type: 'electrique',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../assets/images/pikachu-card.png'),
  attacks: [
    {
  name: 'Queue Battoir',
  damage: 10,
  energyCost: 1,

},
    
  {
  name: 'Éclair',
  damage: 20,
  energyCost: 2,

  requiredEnergies: {
    electrique: 1,
  },

  coinCount: 1,

  coinEffects: [
    {
      side: 'face',
      effect: {
        type: 'paralyze',
        amount: 1,
      },
    },
  ],
   effectText:
    'Lancez une pièce. Si c’est Face, le Pokémon adverse est Paralysé.',
},
  ],
};

const feunardalola: PokemonCard = {
  id: 'feunard-alola-001',
  name: 'Feunard d’alola',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 110,
  retreatCost: 1,
  artwork: require('../../assets/images/feunardalola-card.png'),
  talent: {
  name: 'Barrière Lumineuse',
  type: 'passive',

  effect:
    'preventAllEffectsFromExGx',

  description:
    'Évite tous les effets des attaques, y compris les dégâts, infligés à ce Pokémon par les Pokémon-GX et Pokémon-EX de votre adversaire.',
},
  attacks: [
    
{
  name: 'Onde Boréale',
  damage: 80,
  energyCost: 3,
  requiredEnergies: {
    eau: 1,
  },

}
  ],
};

const malamandregx: PokemonCard = {
  id: 'malamandregx-001',
  name: 'Malamandre GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'feu',
  maxHp: 200,
  retreatCost: 2,
  artwork: require('../../assets/images/malamandregx-card.png'),
  attacks: [
    {
  name: 'Griffes Diaboliques',

  damage: 0,

  energyCost: 2,
    requiredEnergies: {
    feu: 2,
  },


  bonusDamageEveryTwoRounds: 50,

  effectText:
    'Cette attaque inflige 50 dégâts supplémentaires tous les 2 tours.',
},
    
  {
  name: 'Explosion de Chaleur',
  damage: 110,
  energyCost: 2,
    requiredEnergies: {
    feu: 2,
  },
},
  ],
};

const hoohgx: PokemonCard = {
  id: 'hoohgx-001',
  name: 'Ho-Oh GX',
  stage: 'base',
  variant: 'gx',
  type: 'feu',
  maxHp: 190,
  retreatCost: 2,
  artwork: require('../../assets/images/hoohgx-card.png'),
  attacks: [
    {
  name: 'Feu Sacré',
  damage: 50,
  energyCost: 3,
    requiredEnergies: {
    feu: 1,
  },

  targetMode: 'anyOpponentPokemon',
  effectText:
    'Cette attaque inflige 50 dégats à l’un des pokémons de votre adversaire'
},
    
  {
  name: 'Éclat du Phénix',
  damage: 180,
  energyCost: 4,
    requiredEnergies: {
    feu: 3,
  },

  blocksNextOwnTurn: true,
  effectText:
    'Ce Pokémon ne peut pas utiliser Éclat du Phénix pendant votre prochain tour.',
},
  ],
};

const sarmuraï: PokemonCard = {
  id: 'sarmuraï-001',
  name: 'Sarmuraï GX',
  stage: 'niveau1',
  variant: 'gx',
  type: 'plante',
  maxHp: 210,
  retreatCost: 3,
  artwork: require('../../assets/images/sarmurai-card.png'),
  attacks: [
    {
  name:
    'Escarmouche',

  damage: 30,

  energyCost: 1,
    requiredEnergies: {
    plante: 1,
  },


  bonusDamageIfSwitchedRecently:
    90,

  effectText:
    'Si ce Pokémon a échangé de place pendant ce tour ou pendant le dernier tour de votre adversaire, cette attaque inflige 90 dégâts supplémentaires.',
},
    
  {
  name: 'Pression Cuirassée',
  damage: 100,
  energyCost: 3,

  requiredEnergies: {
    plante: 1,
  },

  effects: [
    {
      type:
        'reduceDamageNextOpponentTurn',
      amount: 20,
    },
  ],
   effectText:
    'Pendant le prochain tour de votre adversaire, ce pokémon subit 20 dégats de moins provenant des attaques.',

},
  ],
};

const feuiloutan: PokemonCard = {
  id: 'feuiloutan-001',
  name: 'Feuiloutan',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 90,
  retreatCost: 1,
    artwork: require('../../assets/images/feuiloutan-card.png'),
  attacks: [
    {
      name: 'Griffe',
      damage: 30,
      energyCost: 1,
      
    },
    {
  name: 'Provision de Feuillage',
  damage: 50,
  energyCost: 2,
  requiredEnergies: {
    plante: 1,
  },


   effects: [
    {
      type: 'attachEnergyToBench',

      amount: 1,

      energyType: 'plante',
    },
  ],

  effectText:
    'Attachez une Énergie Plante à l’un de vos Pokémon de banc.',
},

  ],
};

const scarhino: PokemonCard = {
  id: 'scarhino-001',

  name: 'Scarhino',

  stage: 'base',

  variant: 'normal',

  type: 'plante',

  maxHp: 110,

  retreatCost: 2,

  artwork: require(
    '../../assets/images/scarhino-card.png'
  ),

  talent: {
    name: 'Cran',

    type: 'passive',

    effect: 'surviveKOOnCoin',

    description:
      'Si ce Pokémon doit être mis K.O., lancez une pièce. Si c’est Face, ce Pokémon n’est pas mis K.O. et il lui reste 10 PV.',
  },

  attacks: [
    {
      name: 'Lancer',

      damage: 50,

      energyCost: 2,
      requiredEnergies: {
    plante: 2,
  },


      effects: [
        {
          type:
            'forceOpponentActiveSwitch',

          amount: 1,
        },
      ],

      effectText:
        'Votre adversaire échange son Pokémon actif avec l’un de ses Pokémon de banc.',
    },
  ],
};

const coxyclaque: PokemonCard = {
  id: 'coxyclaque-001',
  name: 'Coxyclaque',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../assets/images/coxyclaque-card.png'),
  attacks: [
    {
  name: 'Météores',
  damage: 30,
  energyCost: 1,
   requiredEnergies: {
    plante: 1,
  },

  fixedDamage: 30,
   effectText:
    'Les dégâts de cette attaque ne sont pas affectés par aucun effet en action sur le pokémon actif de votre adversaire.',

},
    
  {
  name: 'Poing Comète',

  damage: 0,

  energyCost: 3,

  coinCount: 4,

  damagePerFace: 40,

  effectText:
    'Lancez 4 pièces. Cette attaque inflige 40 dégâts pour chaque côté Face.',
},
  ],
};

const bouldeneu: PokemonCard = {
  id: 'bouldeneu-001',
  name: 'Bouldeneu',
  stage: 'niveau1',
  variant: 'normal',
  type: 'plante',
  maxHp: 140,
  retreatCost: 4,
  artwork: require('../../assets/images/bouldeneu-card.png'),
  attacks: [
    {
  name: 'Giga-Sangsue',

  damage: 30,

  energyCost: 1,
  requiredEnergies: {
    plante: 1,
  },


  effects: [
    {
      type: 'healSelfByDamageDealt',
      amount: 0,
    },
  ],

  effectText:
    'Soignez à ce Pokémon la même quantité de dégâts que cette attaque a infligée au Pokémon actif de votre adversaire.',
},
    
  {
  name: 'Fouets Croisés',

  damage: 0,

  energyCost: 4,

  coinCount: 4,

  damagePerFace: 50,

  effectText:
    'Lancez 4 pièces. Cette attaque inflige 50 dégâts pour chaque côté Face.',
},
  ],
};

const papilusion: PokemonCard = {
  id: 'papilusion-001',
  name: 'Papilusion',
  stage: 'niveau2',
  variant: 'normal',
  type: 'plante',
  maxHp: 120,
  retreatCost: 1,
  artwork: require('../../assets/images/papilusion-card.png'),
  attacks: [
    {
  name: 'Soins et Adieux',

  damage: 0,

  energyCost: 1, 
  requiredEnergies: {
    plante: 1,
  },


  effects: [
    {
      type: 'healAllOwnAndReturnSelf',
      amount: 0,
    },
  ],

  effectText:
    'Soignez tous les dégâts de chacun de vos Pokémon. Remettez ce Pokémon ainsi que les cartes Outils Pokémon lui étant attaché dans votre main.',
},
    
  {
  name: 'Para-Spore',
  damage: 60,
  energyCost: 3,

  requiredEnergies: {
    plante: 1,
  },

  coinCount: 1,

  coinEffects: [
    {
      side: 'face',
      effect: {
        type: 'paralyze',
        amount: 1,
      },
    },
  ],
   effectText:
    'Lancez une pièce. Si c’est Face, le Pokémon adverse est Paralysé.',
},
  ],
};

const cradopaud: PokemonCard = {
  id: 'cradopaud-001',
  name: 'cradopaud',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
    artwork: require('../../assets/images/cradopaud-card.png'),
  attacks: [
    {
  name: 'Poing Tire-Bouchon',
  damage: 10,
  energyCost: 1,
},
    {
      name: 'Bond de Grenouille',
      damage: 20,
      energyCost: 2,

      requiredEnergies: {
    psy: 1,
  },

   coinCount: 1,

  coinDamageEffects: [
    {
      side: 'face',
      condition: 'any',
      damage: 20,
    },
  ],

  effectText:
    'Lancez une pièce. Si c’est Face, cette attaque inflige 20 dégâts supplémentaires.',
    },
  ],
};

const Necrozmagx: PokemonCard = {
  id: 'necrozma-gx-001',
  name: 'Necrozma GX',
  stage: 'base',
  variant: 'gx',
  type: 'psy',
  maxHp: 180,
  retreatCost: 2,
   artwork: require('../../assets/images/necrozma-card.png'),

talent: {
  name: 'Extinction des Feux',
  type: 'passive',

  effect:
    'preventDamageFromType',

  blockedType: 'normal',

  description:
    'Évite tous les dégâts infligés à ce Pokémon par les attaques des Pokémon de type Normal.',
},

attacks: [
{
  name: 'Explosion Prismatique',

  damage: 10,

  energyCost: 3,

  effects: [
    {
      type:
        'discardAllTypedEnergyForBonus',

      energyType: 'psy',

      // +60 dégâts par Énergie
      amount: 60,
    },
  ],

  effectText:
    'Défaussez toutes les Énergies Psy attachées à ce Pokémon. Cette attaque inflige 60 dégâts supplémentaires pour chaque Énergie défaussée de cette façon.',
}
]
};

const reptincel: PokemonCard = {
  id: 'reptincel-001',
  name: 'Reptincel',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 90,
  retreatCost: 2,
    artwork: require('../../assets/images/reptincel-card.png'),
  attacks: [
    {
      name: 'Tranch-Griffe',
      damage: 30,
      energyCost: 2,
    },
    {
      name: 'Explosion de Chaleur',
      damage: 70,
      energyCost: 3,

        requiredEnergies: {
    feu: 2,
  },

    },
  ],
};

const DracaufeuGx: PokemonCard = {
  id: 'dracaufeu-gx-001',
  name: 'Dracaufeu-Gx',
  stage: 'niveau2',
  variant: 'gx',
  type: 'feu',
  maxHp: 250,
  retreatCost: 2,
  artwork: require('../../assets/images/dracaufeugx-card.png'),
  attacks: [
    {
      name: 'Cru-Aile',
      damage: 70,
      energyCost: 3,
    },
    {
      name: 'Cru-Aile',
      damage: 300,
      energyCost: 5,

        requiredEnergies: {
    feu: 3,
  },


      effects: [
  {
    type: 'discardEnergy',
    amount: 3,
  },
],
   effectText:
    'Défaussez 3 Energies de ce pokémon.',

    },
  ],
};

const boumata: PokemonCard = {
  id: 'boumata-001',
  name: 'Boumata',
  stage: 'base',
  variant: 'normal',
  type: 'feu',
  maxHp: 130,
  retreatCost: 3,
    artwork: require('../../assets/images/boumata-card.png'),
  attacks: [
    {
  name: 'Manteu de Feu',
  damage: 30,
  energyCost: 2,
    requiredEnergies: {
    feu: 1,
  },


  effects: [
    {
      type: 'recoverEnergy',
      amount: 1,
      energyType: 'feu',
    },
  ],

  effectText:
    'Prenez 1 Énergie Feu dans votre pile de défausse et attachez-la à ce Pokémon.',
},
 {
  name: 'Explosion de Chaleur',
  damage: 70,
  energyCost: 3,
    requiredEnergies: {
    feu: 1,
  },
}
  ],
};

const chenipan: PokemonCard = {
  id: 'chenipan-001',
  name: 'chenipan',
  stage: 'base',
  variant: 'normal',
  type: 'plante',
  maxHp: 50,
  retreatCost: 1,
    artwork: require('../../assets/images/chenipan-card.png'),
  attacks: [
    {
      name: 'Attaque Surprise',
      damage: 20,
      energyCost: 1,
       coinCount: 1,
         requiredEnergies: {
    plante: 1,
  },


  failsOn: 'pile',

  effectText:
    "Lancez une pièce. Si c’est Pile, cette attaque ne fait rien.",
    },
  ],
};

const flamoutan: PokemonCard = {
  id: 'flamoutan-001',
  name: 'Flamoutan',
  stage: 'niveau1',
  variant: 'normal',
  type: 'feu',
  maxHp: 90,
  retreatCost: 1,
    artwork: require('../../assets/images/flamoutan-card.png'),
  attacks: [
    {
      name: 'Griffe',
      damage: 30,
      energyCost: 1,
      
    },
    {
  name: 'Flambée Rechargée',
  damage: 50,
  energyCost: 2,
  requiredEnergies: {
    feu: 1,
  },


  effects: [
    {
      type: 'recoverEnergyToBench',
      amount: 1,
      energyType: 'feu',
    },
  ],

  effectText:
    'Attachez 1 Énergie Feu de votre pile de défausse à l’un de vos Pokémon de banc.',
},

  ],
};

const tokopiscogx: PokemonCard = {
  id: 'tokopiscogx-001',
  name: 'Tokopisco Gx',
  stage: 'base',
  variant: 'gx',
  type: 'eau',
  maxHp: 170,
  retreatCost: 1,
    artwork: require('../../assets/images/tokopisco-card.png'),
  attacks: [
    {
      name: 'Anneau Hydro',
      damage: 20,
      energyCost: 1,
       effects: [
    {
      type: 'switchWithBench',
      amount: 1,
    },
  ],

  effectText:
    'Échangez ce Pokémon avec l’un de vos Pokémon de banc situé sur la même ligne.',
    },
    {
  name: 'Hydro-Coup',
  damage: 120,
  energyCost: 3,

  effects: [
    {
      type: 'discardTypedEnergy',
      amount: 2,
      energyType: 'eau',
    },
  ],

  targetMode: 'anyOpponentPokemon',

  effectText:
    'Défaussez 2 Énergies Eau attachées à ce Pokémon. Choisissez 1 Pokémon adverse et infligez-lui 120 dégâts.',
},
  ],
};

const potion: TrainerCard = {
  id: 'potion-001',
  name: 'Potion',
  category: 'objet',
    artwork: require('../../assets/images/potion-card.png'),
  description: 'Soigne 30 dégâts à un de tes Pokémon.',
  effect: 'heal30',
};

const corde_sortie: TrainerCard = {
  id: 'corde_sortie-001',
  name: 'Corde Sortie',
  category: 'objet',
 description:
    "Chaque joueur échange l'un de ses Pokémon avec un autre de ses Pokémon de banc. L'adversaire effectue son échange en premier.",

  effect: 'bothPlayersSwitch',

  artwork: require('../../assets/images/corde-card.png'
  ),
};

const haltère: TrainerCard = {
  id: 'haltère-001',
  name: 'Haltères de Culturisme',
  category: 'objet',
  subtype: 'outil',

    artwork: require('../../assets/images/haltere-card.png'),

  description:
    'Attachez cette carte à un Pokémon de Niveau 1. Ce Pokémon gagne 40 PV maximum.',

  effect: 'toolHp40',
};

const Fanclubpokemon: TrainerCard = {
  id: 'fanclubpokemon-001',

  name: 'Fan Club Pokemon',

  category: 'supporter',

  description:
    'Invoquez 2 Pokémon de Base ayant 60 PV ou moins sur votre banc.',

  effect: 'summonTwoBase60',

  artwork: require('../../assets/images/fanclubpokemon-card.png'),
};

const kiawe: TrainerCard = {
  id: 'kiawe-001',
  name: 'Kiawe',
  category: 'supporter',
    artwork: require('../../assets/images/kiawe-card.png'),
  description:
    'Ajoutez 2 Énergies Feu à l’un de vos Pokémon de type Feu. Votre tour se termine.',

  effect: 'attach2FireEndTurn',
};

const margie: TrainerCard = {
  id: 'margie-001',
  name: 'Margie',
  category: 'supporter',
   description:
    'Placez l’un de vos pokémon avec des marqueurs de dégâts et les cartes outils qui lui sont attachées dans votre main.',

  effect: 'returnPokemonToHand',

  artwork: require('../../assets/images/margie-card.png'
  ),
};

const frison: PokemonCard = {
  id: 'frison-001',
  name: 'Frison',
  stage: 'base',
  variant: 'normal',
  type: 'normal',
  maxHp: 120,
  retreatCost: 2,
  artwork: require('../../assets/images/frison-card.png'),
  attacks: [
    {
  name: 'Tete Frisée',
  damage: 30,
  energyCost: 2,

  effects: [
    {
      type:
        'reduceDamageNextOpponentTurn',
      amount: 30,
    },
  ],

  effectText:
    'Pendant le prochain tour de votre adversaire, ce Pokémon subit 30 dégâts de moins provenant des attaques.',
},
{
  name: 'Culbute',
  damage: 80,
  energyCost: 3,
}
  ],
};

const mackogneurgx: PokemonCard = {
  id: 'mackogneur-gx-001',
  name: 'Mackogneur GX',
  stage: 'niveau2',
  variant: 'gx',
  type: 'combat',
  maxHp: 250,
  retreatCost: 3,
    artwork: require('../../assets/images/mackogneurgx-card.png'),
  attacks: [
    {
  name: 'Coupe Transversale',
  damage: 60,
  energyCost: 2,
    requiredEnergies: {
    combat: 2,
  },


  bonusDamageIfTargetEvolved: 60,

  effectText:
    'Si le Pokémon actif de votre adversaire est un Pokémon évolutif, cette attaque inflige 60 dégâts supplémentaires.',
},
 {
  name: 'Brise Fondation',
  damage: 130,
  energyCost: 3,
    requiredEnergies: {
    combat: 3,
  },
},
  ],
};

const persian: PokemonCard = {
  id: 'persian-001',
  name: 'Persian',
  stage: 'niveau1',
  variant: 'normal',
  type: 'normal',
  maxHp: 90,
  retreatCost: 1,
    artwork: require('../../assets/images/persian-card.png'),
  attacks: [
    {
  name: 'Grincement',

  damage: 0,

  energyCost: 1,

  effects: [
    {
      type: 'takeExtraDamageNextTurn',
      amount: 60,
    },
  ],

  effectText:
    'Pendant votre prochain tour, le Pokémon Défenseur subit 60 dégâts supplémentaires des attaques.',
},
{
  name: 'Tranche',

  damage: 40,

  energyCost: 1,
},
  ],
};

const hyporoi: PokemonCard = {
  id: 'hyporoi-001',
  name: 'Hyporoi',
  stage: 'niveau2',
  variant: 'normal',
  type: 'eau',
  maxHp: 140,
  retreatCost: 1,
    artwork: require('../../assets/images/hyporoi-card.png'),
  attacks: [
    {
  name: 'Saumure',
  damage: 90,
  energyCost: 1,
  requiredEnergies: {
    eau: 1,
  },


  targetMode:
    'damagedOpponentOrPlayer',

  effectText:
    'Cette attaque inflige 90 dégâts à l’un des Pokémon de votre adversaire ayant au moins 1 marqueur de dégâts.',
},
{
  name: 'Tir Tornade',
  damage: 90,
  energyCost: 1,
  requiredEnergies: {
    eau: 1,
  },


  effects: [
    {
      type: 'discardEnergy',
      amount: 1,
    },
  ],

  secondaryBenchOrPlayerDamage: 30,

  effectText:
    'Défaussez 1 Énergie de ce Pokémon. Cette attaque inflige aussi 30 dégâts à l’un des Pokémon de banc de votre adversaire.',
},
  ],
};

const denticrisse: PokemonCard = {
  id: 'denticrisse-001',
  name: 'Denticrisse',
  stage: 'base',
  variant: 'normal',
  type: 'eau',
  maxHp: 100,
  retreatCost: 1,
  artwork: require('../../assets/images/denticrisse-card.png'),
  attacks: [
    {
      name: 'Grincedent',
      energyCost: 1,
        requiredEnergies: {
    eau: 1,
  },

      damage: 0,
           effects: [
    {
      type: 'confuse',
      amount: 1,
    },
  ],
   effectText:
    'Le pokémon actif de votre adversaire est maintenant confus.',

    },
  


    
    {
  name: 'Synchropeine',

  damage: 60,

  energyCost: 3,
    requiredEnergies: {
    eau: 1,
  },


  benchDamageSameTypeAsTarget: 20,

  effectText:
    'Inflige 20 dégâts à chaque Pokémon de banc de votre adversaire ayant le même type que le Pokémon actif de votre adversaire.',
},
  ],
};

const rafflesia: PokemonCard = {
  id: 'rafflesia-001',
  name: 'Rafflesia',
  stage: 'niveau2',
  variant: 'normal',
  type: 'plante',
  maxHp: 140,
  retreatCost: 3,
  artwork: require('../../assets/images/rafflesia-card.png'),

  talent: {
  name: 'Pollen Dégoutant',
  type: 'passive',
  effect: 'blockBaseAttacks',
  description:
    'Tant que ce Pokémon est actif, les Pokémon de Base ne peuvent pas attaquer.',
},

  attacks: [
    {
      name: 'Choc Immobilisateur',
      damage: 60,
      energyCost: 3,
      requiredEnergies: {
    plante: 2,
  },

  coinCount: 1,

  coinEffects: [
    {
      side: 'pile',
      effect: {
        type: 'paralyze',
        amount: 1,
      },
    },

    {
      side: 'face',
      effect: {
        type: 'confuse',
        amount: 1,
       },
      },
     ],
      effectText:
    'Lancez une pièce. Si c’est PILE, le Pokémon adverse est Paralysé. Si c’est FACE, il est Confus.',
    },
  ],
};

const noctunoir: PokemonCard = {
  id: 'noctunoir-001',
  name: 'Noctunoir',
  stage: 'niveau2',
  variant: 'normal',
  type: 'psy',
  maxHp: 150,
  retreatCost: 3,
  artwork: require('../../assets/images/noctunoir-card.png'),
  talent: {
  name: 'Invitation Obscure',
  type: 'passive',
  effect: 'damageOpponentOnPlay',
  amount: 30,

  description:
    'Lorsque votre adversaire pose un Pokémon, ce Pokémon subit 30 dégâts.',
},
  attacks: [
    {
  name: 'Emprise Mentale',

  damage: 30, 

  energyCost: 3,
  requiredEnergies: {
    psy: 1,
  },


  bonusDamagePerOpponentBenchPokemon:
    30,

  effectText:
    'Cette attaque inflige 30 dégâts supplémentaires pour chacun des Pokémon de banc de votre adversaire.',
},
  ],
};

const relais: TrainerCard = {
  id: 'relais-001',
  name: 'Relais Optimiste',
  category: 'objet',
    artwork: require('../../assets/images/relais-card.png'),
  description:
    'Si le Pokémon auquel cette carte est attachée est mis K.O., déplacez 1 Énergie de ce Pokémon vers l’un de vos autres Pokémon.',

  effect: 'moveEnergyOnKO',
};

const super_rappel: TrainerCard = {
  id: 'rappel-002',
  name: 'Super Rappel',
  category: 'objet',
    artwork: require('../../assets/images/super_rappel-card.png'),
  description:
    'Lancez une pièce. Si c’est Face, choisissez l’un de vos Pokémon en jeu et remettez ce Pokémon ainsi que son Outil Pokémon attaché dans votre main.',

  effect:
    'coinReturnPokemonToHand',

  coinCount: 1,
};

const nephie: TrainerCard = {
  id: 'nephie-001',
  name: 'Néphie',
  category: 'supporter',
    artwork: require('../../assets/images/nephie-card.png'),
  description:
    'Soignez 50 dégâts à chacun de vos Pokémon auxquels est attachée au moins 1 Énergie Eau.',

  effect: 'healWaterEnergy50',
};

const guzma: TrainerCard = {
  id: 'guzma-001',
  name: 'Guzma',
  category: 'supporter',
    artwork: require('../../assets/images/guzma-card.png'),
  description:
    'Échangez l’un des Pokémon de votre adversaire avec un autre de ses Pokémon. Ensuite, échangez l’un de vos Pokémon avec un autre de vos Pokémon.',

  effect:
    'forceOpponentThenSelfSwitch',
};

const ALL_POKEMON_CARDS: PokemonCard[] = [
  chenipan,
  papilusion,
  rafflesia,
  bouldeneu,
  coxyclaque,
  scarhino,
  feuiloutan,
  sarmuraï,
  reptincel,
  DracaufeuGx,
  hoohgx,
  flamoutan,
  malamandregx,
  boumata,
  feunardalola,
  hyporoi,
  denticrisse,
  tokopiscogx,
  pikachu,
  noctunoir,
  cradopaud,
  Necrozmagx,
  mackogneurgx,
  persian,
  frison,
  
  

  // AJOUTE ICI TOUS LES AUTRES
  // Pokémon déjà créés dans ton fichier
];

const ALL_TRAINER_CARDS: TrainerCard[] = [
  corde_sortie,
  guzma,
  haltère,
  kiawe,
  margie,
  nephie,
  potion,
  relais,
  super_rappel,
  Fanclubpokemon,
  


  // AJOUTE ENSUITE TOUS TES
  // AUTRES OBJETS ET SUPPORTERS
];

function createEmptyBoard(): BoardState {
  const board: BoardState = {};

  ['A', 'B', 'C', 'D'].forEach((row) => {
    [1, 2, 3, 4].forEach((column) => {
      board[`${row}${column}`] = null;
    });
  });

  return board;
}

function getTypeIcon(type: EnergyType) {
  switch (type) {
    case 'electrique':
      return '⚡';

    case 'feu':
      return '🔥';

    case 'eau':
      return '💧';

    case 'plante':
      return '🌿';

    case 'psy':
      return '🔮';

    case 'combat':
      return '🥊';

    case 'normal':
      return '⚪';

    case 'obscurite':
      return '🌑';

    case 'metal':
      return '⚙️';

    case 'fee':
      return '🐉';

    default:
      return '●';
  }
}

function oppositeCoinSide(
  side: CoinSide
): CoinSide {
  return side === 'face'
    ? 'pile'
    : 'face';
}

function invertCoinResult(
  result: CoinSide[]
): CoinSide[] {
  return result.map(
    (side) => oppositeCoinSide(side)
  );
}

function areCoinResultsEqual(
  first: CoinSide[],
  second: CoinSide[]
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  return first.every(
    (side, index) =>
      side === second[index]
  );
}

function resolveCoinFlip(
  history: CoinHistory,
  coinCount: number,
  constraints: CoinConstraintQueues
): CoinFlipResolution {
  const historyResult =
    getNextCoinResultFromHistory(
      history,
      coinCount
    );

  const trainerConstraint =
    getPendingCoinConstraint(
      constraints,
      coinCount
    );

  // --------------------------------
  // AUCUN HISTORIQUE DU POKÉMON
  // --------------------------------

  if (!historyResult) {
    // Un Dresseur impose le résultat
    if (trainerConstraint) {
      return {
        result: trainerConstraint,
        choiceAllowed: false,
        consumeTrainerConstraint: true,
        reason: 'trainer',
      };
    }

    // Premier lancer totalement libre
    return {
      result: null,
      choiceAllowed: true,
      consumeTrainerConstraint: false,
      reason: 'free',
    };
  }

  // --------------------------------
  // LE POKÉMON A DÉJÀ UN HISTORIQUE
  // --------------------------------

  if (!trainerConstraint) {
    return {
      result: historyResult,
      choiceAllowed: false,
      consumeTrainerConstraint: false,
      reason: 'history',
    };
  }

  // --------------------------------
  // LE DRESSEUR IMPOSE EXACTEMENT
  // LE RÉSULTAT QUE LE POKÉMON
  // DEVAIT DÉJÀ OBTENIR
  // --------------------------------

  if (
    areCoinResultsEqual(
      historyResult,
      trainerConstraint
    )
  ) {
    return {
      result: historyResult,
      choiceAllowed: false,

      // La contrainte attend encore.
      consumeTrainerConstraint: false,

      reason: 'history',
    };
  }

  // --------------------------------
  // LE DRESSEUR IMPOSE UN RÉSULTAT
  // DIFFÉRENT
  // --------------------------------

  return {
    result: trainerConstraint,
    choiceAllowed: false,
    consumeTrainerConstraint: true,
    reason: 'trainer',
  };
}

function saveCoinResult(
  history: CoinHistory,
  coinCount: number,
  result: CoinSide[]
): CoinHistory {
  return {
    ...history,
    [coinCount]: [...result],
  };
}

function createAttackPaths(
  startCell: string,
  player: Player
): AttackPath[] {
  const row = startCell[0];
  const column =
    Number(startCell.slice(1));

  const frontRow =
    player === 1 ? 'B' : 'C';

  const backRow =
    player === 1 ? 'A' : 'D';

  const makeColumnCells = (
    col: number
  ): string[] => {
    // Si on commence déjà sur la ligne arrière,
    // la ligne avant de cette colonne est perdue.
    if (
      col === column &&
      row === backRow
    ) {
      return [`${backRow}${col}`];
    }

    return [
      `${frontRow}${col}`,
      `${backRow}${col}`,
    ];
  };

  const leftPath: string[] = [];
  const rightPath: string[] = [];

  // Colonne de départ
  leftPath.push(
    ...makeColumnCells(column)
  );

  rightPath.push(
    ...makeColumnCells(column)
  );

  // Vers la gauche
  for (
    let col = column - 1;
    col >= 1;
    col--
  ) {
    leftPath.push(
      `${frontRow}${col}`,
      `${backRow}${col}`
    );
  }

  // Vers la droite
  for (
    let col = column + 1;
    col <= 4;
    col++
  ) {
    rightPath.push(
      `${frontRow}${col}`,
      `${backRow}${col}`
    );
  }

  // Retirer tout ce qui se trouve
  // avant la vraie case de départ.
  const cleanPath = (
    path: string[]
  ) => {
    const startIndex =
      path.indexOf(startCell);

    return path.slice(startIndex);
  };

  return [
    cleanPath(leftPath),
    cleanPath(rightPath),
  ];
}



function consumeCoinConstraint(
  constraints: CoinConstraintQueues,
  coinCount: number
): CoinConstraintQueues {
  const queue =
    constraints[coinCount] ?? [];

  if (queue.length === 0) {
    return constraints;
  }

  const remainingQueue =
    queue.slice(1);

  const newConstraints = {
    ...constraints,
  };

  if (remainingQueue.length === 0) {
    delete newConstraints[coinCount];
  } else {
    newConstraints[coinCount] =
      remainingQueue;
  }

  return newConstraints;
}

function addTrainerCoinConstraint(
  constraints: CoinConstraintQueues,
  coinCount: number,
  trainerResult: CoinSide[]
): CoinConstraintQueues {
  const currentQueue =
    constraints[coinCount] ?? [];

  const nextRequiredResult =
    invertCoinResult(trainerResult);

  return {
    ...constraints,

    [coinCount]: [
      ...currentQueue,
      nextRequiredResult,
    ],
  };
}

function getNextCoinResultFromHistory(
  history: CoinHistory,
  coinCount: number
): CoinSide[] | null {
  const lastResult = history[coinCount];

  if (!lastResult) {
    return null;
  }

  return invertCoinResult(lastResult);
}

function getPendingCoinConstraint(
  constraints: CoinConstraintQueues,
  coinCount: number
): CoinSide[] | null {
  const queue = constraints[coinCount];

  if (!queue || queue.length === 0) {
    return null;
  }

  return queue[0];
}

function formatEnergies(energies: EnergyType[]) {
  if (energies.length === 0) {
    return 'Aucune';
  }

  return energies
    .map((energy) => getTypeIcon(energy))
    .join(' ');
}

function canPayTypedDiscard(
  energies: EnergyType[],
  attack: Attack
): boolean {
  const typedDiscard =
    attack.effects?.find(
      (effect) =>
        effect.type ===
          'discardTypedEnergy' &&
        effect.energyType
    );

  if (
    !typedDiscard ||
    !typedDiscard.energyType
  ) {
    return true;
  }

  const available =
    energies.filter(
      (energy) =>
        energy ===
        typedDiscard.energyType
    ).length;

  return (
    available >= typedDiscard.amount
  );
}

function canPayAttackCost(
  energies: EnergyType[],
  attack: Attack
) {
  const requirements =
    attack.requiredEnergies ?? {};

  let requiredTotal = 0;

  for (const [type, amount] of Object.entries(
    requirements
  )) {
    const requiredAmount = amount ?? 0;

    const availableAmount = energies.filter(
      (energy) => energy === type
    ).length;

    if (availableAmount < requiredAmount) {
      return false;
    }

    requiredTotal += requiredAmount;
  }

  return energies.length >= attack.energyCost;
}

function formatAttackCost(attack: Attack) {
  const symbols: string[] = [];

  const requirements =
    attack.requiredEnergies ?? {};

  let requiredTotal = 0;

  for (const [type, amount] of Object.entries(
    requirements
  )) {
    const number = amount ?? 0;

    for (let i = 0; i < number; i++) {
      symbols.push(
        getTypeIcon(type as EnergyType)
      );
    }

    requiredTotal += number;
  }

  const colorless =
    attack.energyCost - requiredTotal;

  for (let i = 0; i < colorless; i++) {
    symbols.push('◇');
  }

  return symbols.join(' ');
}

function getStageName(stage: Stage) {
  switch (stage) {
    case 'base':
      return 'Base';

    case 'niveau1':
      return 'Niveau 1';

    case 'niveau2':
      return 'Niveau 2';

    case 'mega_ex':
      return 'Méga Pokémon-ex';

    default:
      return '';
  }
}

function getVariantName(
  variant: CardVariant
): string {
  switch (variant) {
    case 'ex':
      return 'ex';

    case 'gx':
      return 'GX';

    default:
      return '';
  }
}

function canPlacePokemon(
  card: PokemonCard,
  round: number
) {
  if (
    card.stage === 'base'
  ) {
    return true;
  }

  if (
    card.stage === 'niveau1' ||
    card.stage === 'mega_ex'
  ) {
    return round >= 2;
  }

  if (card.stage === 'niveau2') {
    return round >= 3;
  }

  return false;
}

function getKOPenalty(
  stage: Stage,
  variant: CardVariant
) {
  // Variantes spéciales


  if (variant === 'ex') {
    return 50;
  }

  if (variant === 'gx') {
    return 50; // provisoire : on peut choisir une autre pénalité
  }

  // Pokémon normaux
  switch (stage) {
    case 'base':
      return 10;

    case 'niveau1':
      return 20;

    case 'niveau2':
      return 30;

    case 'mega_ex':
      return 100;

    default:
      return 0;
  }
}

function isPokemonCard(card: GameCard): card is PokemonCard {
  return 'stage' in card;
}

function applyAttackEffects(
  pokemon: PokemonInPlay,
  attack: Attack
): PokemonInPlay {
  let updatedPokemon = {
    ...pokemon,
  };

  if (!attack.effects) {
    return updatedPokemon;
  }

  for (const effect of attack.effects) {


    // SOIN
    if (effect.type === 'heal') {
      updatedPokemon = {
        ...updatedPokemon,

        currentHp: Math.min(
          updatedPokemon.currentHp + effect.amount,
          getPokemonMaxHp(updatedPokemon)
        ),
      };
    }

    

    // DÉFAUSSE D'ÉNERGIES
    if (effect.type === 'discardEnergy') {
      updatedPokemon = {
        ...updatedPokemon,

        energies: updatedPokemon.energies.slice(
          0,
          Math.max(
            0,
            updatedPokemon.energies.length -
              effect.amount
          )
        ),
      };
    }

    // DÉGÂTS DE RECUL
    if (effect.type === 'recoil') {
      updatedPokemon = {
        ...updatedPokemon,

        currentHp:
          updatedPokemon.currentHp -
          effect.amount,
      };
    }
  }

  return updatedPokemon;
}

function getTypeCardColors(type: EnergyType) {
  switch (type) {
    case 'electrique':
      return {
        card: '#F7E08A',
        header: '#F2D24B',
        border: '#D4AF37',
        attackBg: '#F6E79F',
      };

    case 'combat':
  return {
    card: '#D9C3B0',
    header: '#B8875C',
    border: '#8B5E3C',
    attackBg: '#E8D7C8',
  };

    case 'feu':
      return {
        card: '#F7C29D',
        header: '#F08B4F',
        border: '#D46A1F',
        attackBg: '#F9D1B5',
      };

    case 'eau':
      return {
        card: '#B8D9F8',
        header: '#6AAAE8',
        border: '#3E84C6',
        attackBg: '#CFE5FA',
      };

    case 'plante':
      return {
        card: '#BFE3B4',
        header: '#75B86A',
        border: '#4E8F45',
        attackBg: '#D2ECCB',
      };

    case 'psy':
      return {
        card: '#D9C2F0',
        header: '#A77DD6',
        border: '#7C56B1',
        attackBg: '#E5D7F7',
      };

    default:
      return {
        card: '#E8E8E8',
        header: '#D8D8D8',
        border: '#B8B8B8',
        attackBg: '#EFEFEF',
      };
  }
}

function getPokemonMaxHp(
  pokemon: PokemonInPlay
): number {
  let maxHp = pokemon.card.maxHp;

  if (
    pokemon.attachedTool?.effect ===
    'toolHp40'
  ) {
    maxHp += 40;
  }

  return maxHp;
}

const styles = StyleSheet.create({

  statusText: {
  color: '#dddddd',
  fontSize: 10,
  fontWeight: 'bold',
  marginTop: 2,
},

discardPreviewOverlay: {
  width: '100%',

  backgroundColor:
    'rgba(255,255,255,0.97)',

  borderWidth: 2,
  borderColor: '#333',
  borderRadius: 12,

  padding: 10,

  marginBottom: 12,
},
discardPreviewHeader: {
  flexDirection: 'row',
  justifyContent:
    'space-between',
  alignItems: 'center',

  marginBottom: 6,
},

discardPreviewTitle: {
  fontWeight: 'bold',
  fontSize: 16,
},

discardPreviewClose: {
  fontSize: 20,
  fontWeight: 'bold',

  paddingHorizontal: 6,
},

discardPreviewScroll: {
  width: '100%',
  height: 500,

  flexGrow: 0,
},

discardPreviewColumns: {
  flexDirection: 'row',
  alignItems: 'flex-start',

  paddingRight: 10,
},

discardPreviewColumn: {
  width: 180,

  flexDirection: 'column',

  gap: 10,

  marginRight: 10,
},

discardPreviewCard: {
  width: 180,
  height: 240,

  alignItems: 'center',
  justifyContent: 'center',

  overflow: 'visible',
},

discardPreviewPokemonSize: {
  width: 140,
  height: 200,
},

discardPreviewEmpty: {
  textAlign: 'center',
  marginTop: 20,
  fontStyle: 'italic',
},

handPokemonSelectionBorder: {
  borderWidth: 4,
  borderRadius: 14,
  padding: 2,
},

handPokemonSelected: {
  borderColor: '#22c55e',
},

handPokemonNotSelected: {
  borderColor: 'transparent',
},

setupPokemonSelectionBorder: {
  borderWidth: 4,
  borderRadius: 14,
  padding: 2,
},

setupPokemonSelected: {
  borderColor: '#22c55e',
},

setupPokemonNotSelected: {
  borderColor: 'transparent',
},

setupTrainerWrapper: {
  borderWidth: 4,
  borderColor: 'transparent',
  borderRadius: 14,
  padding: 2,
},

setupTrainerSelected: {
  borderColor: '#22c55e',
  borderWidth: 5,
},

setupPokemonRows: {
  width: '100%',
},

setupPokemonRow: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 24,
},

setupPokemonCell: {
  alignItems: 'center',
  marginBottom: 20,
},

setupGrid: {
  width: '100%',

  flexDirection: 'row',

  flexWrap: 'wrap',

  alignItems: 'flex-start',
},

setupGridCell: {
  width: '14.28%',

  alignItems: 'center',

  marginBottom: 24,
},

playerTargetDamage: {
  fontSize: 14,
  fontWeight: '700',
  marginTop: 8,
  textAlign: 'center',
},

playerHandRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  width: '100%',
  gap: 12,
},

playerHandContent: {
  flex: 1,
  minWidth: 0,
},

playerTargetCard: {
  backgroundColor: '#f2f2f2',

  borderWidth: 3,
  borderColor: '#d4af37',
  borderRadius: 12,

  justifyContent: 'center',
  alignItems: 'center',

  padding: 10,

  flexShrink: 0,
  flexGrow: 0,
  alignSelf: 'flex-start',
},

playerTargetCardSelectable: {
  borderWidth: 4,
},

playerTargetName: {
  fontSize: 16,
  fontWeight: '800',
  textAlign: 'center',
},

playerTargetHp: {
  fontSize: 14,
  fontWeight: '700',
  marginTop: 10,
},

playerTargetStatus: {
  fontSize: 12,
  marginTop: 5,
  textAlign: 'center',
},

gxText: {
  color: '#C0C0C0',
  fontWeight: 'bold',
},

gxCardBorder: {
  borderColor: '#c0c0c0',
  borderWidth: 4,
},

miniCardHeaderLeft: {
  flex: 1,
  alignItems: 'flex-start',
},

miniCardNameRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

gxNameText: {
  fontSize: 12,
  fontWeight: '900',

  // GX entièrement argenté
  color: '#0a0b04',
},

talentLikeAttack: {
  width: '100%',

  paddingTop: 3,
  paddingBottom: 4,
  paddingHorizontal: 4,

  // Trait séparant le Talent
  // de la première attaque
  borderBottomWidth: 0.5,
  borderBottomColor: '#000',
},

talentLikeAttackTitle: {
  fontSize: 10,
  lineHeight: 12,

  fontWeight: 'bold',

  // Talent + nom en rouge
  color: '#c62828',
},

talentLikeAttackDescription: {
  marginTop: 2,

  // Même petite taille que
  // la description des attaques
  fontSize: 8,
  lineHeight: 10,

  color: '#333',
},

miniTalentBlock: {
  width: '92%',
  marginTop: 4,
  marginBottom: 4,
  paddingVertical: 3,
  paddingHorizontal: 4,
  borderWidth: 1,
  borderColor: '#cc2222',
  borderRadius: 6,
  backgroundColor: '#fff5f5',
},

miniTalentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 2,
},

miniTalentBadge: {
  borderWidth: 1,
  borderColor: '#cc2222',
  color: '#cc2222',
  fontSize: 8,
  fontWeight: 'bold',
  paddingHorizontal: 4,
  paddingVertical: 1,
  borderRadius: 4,
  marginRight: 5,
},

miniTalentName: {
  flexShrink: 1,
  color: '#cc2222',
  fontSize: 9,
  fontWeight: 'bold',
},

miniTalentEffect: {
  color: '#333333',
  fontSize: 8,
  lineHeight: 10,
},

pokemonTalentBox: {
  width: '100%',
  marginTop: 6,
  marginBottom: 6,
  padding: 6,
  borderWidth: 1,
  borderRadius: 6,
},

pokemonTalentName: {
  fontWeight: 'bold',
  fontSize: 12,
},

pokemonTalentText: {
  fontSize: 10,
  marginTop: 2,
},

trainerCard: {
  width: 170,
  height: 240,

  backgroundColor: '#FFF4A8',

  borderWidth: 5,
  borderColor: '#F5D84A',

  borderRadius: 15,

  padding: 5,
  marginRight: 10,

  overflow: 'hidden',
},

trainerTopHeader: {
  width: '100%',
  height: 22,

  flexDirection: 'row',
  alignItems: 'center',

  paddingHorizontal: 7,

  backgroundColor: '#E6E7E8',

  borderWidth: 1,
  borderColor: '#A8B2B7',

  borderRadius: 7,
},

trainerHeaderLeft: {
  flex: 1,

  fontSize: 9,
  fontWeight: 'bold',
  fontStyle: 'italic',

  color: '#555',
},

trainerHeaderSeparator: {
  marginHorizontal: 6,

  fontSize: 11,
  color: '#888',
},

trainerHeaderRight: {
  fontSize: 9,
  fontWeight: 'bold',

  color: '#1678B8',
},

trainerNameBar: {
  width: '100%',
  height: 25,

  justifyContent: 'center',

  marginTop: 2,

  paddingHorizontal: 7,

  backgroundColor: '#E8E9E9',

  borderWidth: 1,
  borderColor: '#A5ADB2',

  borderRadius: 4,
},

trainerCardName: {
  fontSize: 13,
  fontWeight: 'bold',

  color: '#222',
},

trainerArtworkFrame: {
  width: '94%',
  height: 92,

  alignSelf: 'center',

  marginTop: 3,

  backgroundColor: '#DDEFF4',

  borderWidth: 2,
  borderColor: '#6CC6DC',

  overflow: 'hidden',
},

trainerArtworkImage: {
  width: '100%',
  height: '100%',
},

trainerArtworkPlaceholder: {
  fontSize: 11,
  fontWeight: 'bold',

  color: '#555',

  textAlign: 'center',
},

trainerToolBar: {
  width: '94%',
  height: 16,

  alignSelf: 'center',

  justifyContent: 'center',

  paddingHorizontal: 5,

  backgroundColor: '#DDF3F7',

  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderBottomWidth: 1,

  borderColor: '#67BDD5',
},

trainerToolText: {
  fontSize: 7,
  fontWeight: 'bold',
  fontStyle: 'italic',

  color: '#267C9A',
},

trainerDescriptionBox: {
  flex: 1,

  width: '94%',

  alignSelf: 'center',

  marginTop: 4,

  paddingHorizontal: 8,
  paddingVertical: 7,

  backgroundColor: '#F4F4F2',

  borderWidth: 1,
  borderColor: '#C8C8C5',

  borderRadius: 2,
},

trainerDescription: {
  fontSize: 8,
  lineHeight: 11,

  color: '#222',

  textAlign: 'left',
},

handPokemonPressable: {
  width: 140,
  height: 200,
  marginRight: 10,
  padding: 0,
  borderRadius: 14,
  overflow: 'hidden',
},

cellLabel: {
  color: 'white',
  fontWeight: 'bold',
  marginBottom: 6,
},

pokemonInCell: {
  marginTop: 20,
  width: '85%',
  backgroundColor: 'rgba(0,0,0,0.55)',
  borderRadius: 10,
  padding: 6,
  alignItems: 'center',
},

cellPokemonName: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 12,
  textAlign: 'center',
},

cellPokemonInfo: {
  color: 'white',
  fontSize: 10,
  textAlign: 'center',
},

  discardBox: {
  marginVertical: 10,
  alignItems: 'center',
 },

 discardTitle: {
  color: '#cccccc',
  fontSize: 14,
  fontWeight: 'bold',
 },

 discardCard: {
  color: '#999999',
  fontSize: 13,
  marginTop: 2,
 },

  screen: {
    flex: 1,
    backgroundColor: '#111111',
  },

  container: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 60,
  },

  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
  },

  round: {
    color: '#cccccc',
    fontSize: 18,
    marginTop: 5,
  },

  turnBox: {
    marginVertical: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#292929',
    borderRadius: 10,
  },

  turnText: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
  },

  playerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  player1: {
    color: '#4da6ff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 15,
  },

  player2: {
    color: '#ff6666',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 15,
  },

  damage: {
    color: 'white',
    fontSize: 16,
  },

  info: {
    color: '#cccccc',
    marginVertical: 5,
  },

  handTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginVertical: 8,
  },

  hand: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 5,
  gap: 10,
},

  handScroll: {
  width: '100%',
  maxWidth: 700,
},

playerStatus: {
  color: '#dddddd',
  fontSize: 14,
  fontWeight: 'bold',
  marginLeft: 10,
},

  card: {
    width: 160,
    minHeight: 110,
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#777777',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },

  selectedCard: {
    borderWidth: 4,
    borderColor: '#ffd700',
  },

  disabledCard: {
    opacity: 0.4,
  },

  cardName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  cardInfo: {
    color: '#dddddd',
    marginTop: 4,
  },

  emptyHand: {
    color: '#888888',
  },

  board: {
    alignItems: 'center',
    marginVertical: 15,
  },

  row: {
    flexDirection: 'row',
  },

  rowLabel: {
    width: 35,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },

  columnLabel: {
    width: 75,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },

  cell: {
    width: 75,
    height: 75,
    borderWidth: 2,
    borderColor: '#dddddd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },

  player1Back: {
    backgroundColor: '#152a3d',
  },

  player1Front: {
    backgroundColor: '#1e4d73',
  },

  player2Front: {
    backgroundColor: '#733333',
  },

  player2Back: {
    backgroundColor: '#3d2020',
  },

  occupiedCell: {
    borderWidth: 3,
    borderColor: '#ffd700',
  },

  selectedPokemon: {
    borderWidth: 5,
    borderColor: '#00ff99',
  },

  cellText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },

  pokemonName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  pokemonInfo: {
    color: '#eeeeee',
    fontSize: 11,
    marginTop: 2,
  },

  attackedText: {
    color: '#aaaaaa',
    fontSize: 9,
    marginTop: 2,
  },

  actionBox: {
    width: 300,
    backgroundColor: '#242424',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },

  actionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  actionInfo: {
    color: '#dddddd',
    marginTop: 4,
  },

  attackButton: {
    backgroundColor: '#dddddd',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 9,
    marginTop: 12,
  },

  attackButtonText: {
    color: '#111111',
    fontWeight: 'bold',
    fontSize: 16,
  },

  retreatButton: {
  backgroundColor: '#555555',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 9,
  marginTop: 8,
},

retreatButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

  messageBox: {
    minHeight: 65,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  message: {
    color: '#ffd700',
    textAlign: 'center',
    fontSize: 15,
  },

  endTurnButton: {
    marginTop: 10,
    backgroundColor: '#dddddd',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
  },

  endTurnText: {
    color: '#111111',
    fontSize: 17,
    fontWeight: 'bold',
  },
  restartButton: {
  marginTop: 15,
  backgroundColor: '#444444',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 10,
},

restartButtonText: {
  color: 'white',
  fontSize: 15,
  fontWeight: 'bold',
},

attackTitle: {
  color: 'white',
  fontSize: 17,
  fontWeight: 'bold',
  marginTop: 12,
  marginBottom: 5,
},

attackChoice: {
  width: '100%',
  backgroundColor: '#333333',
  borderWidth: 2,
  borderColor: '#666666',
  borderRadius: 8,
  padding: 10,
  marginTop: 6,
},

attackEffectText: {
  color: '#bbbbbb',
  fontSize: 12,
  textAlign: 'center',
  marginTop: 4,
},

selectedAttackChoice: {
  borderColor: '#ffd700',
  borderWidth: 3,
},

attackChoiceName: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
},

attackChoiceInfo: {
  color: '#cccccc',
  fontSize: 13,
  textAlign: 'center',
  marginTop: 3,
},

battleAreaScroll: {
  width: '100%',
  marginVertical: 20,
},

battleAreaScrollContent: {
  paddingHorizontal: 10,
},

battleAreaRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},

rightBattlePanel: {
  width: 330,
  minHeight: 946,

  marginLeft: 18,

  padding: 12,

  backgroundColor:
    'rgba(20, 20, 20, 0.92)',

  borderRadius: 12,
},

attachedToolPreview: {
  width: '100%',
  alignItems: 'center',
  marginBottom: 15,
},

attachedToolPreviewTitle: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
},

attachedToolThumbnail: {
  position: 'absolute',

  left: 3,
  top: 48,

  width: 28,
  height: 44,

  zIndex: 30,

  backgroundColor: '#E8F4F8',

  borderWidth: 2,
  borderColor: '#62B9D2',

  borderRadius: 4,

  overflow: 'hidden',
},

attachedToolThumbnailImage: {
  width: '100%',
  height: '100%',
},

attachedToolThumbnailFallback: {
  flex: 1,

  textAlign: 'center',
  textAlignVertical: 'center',

  fontSize: 15,
},

boardWrapper: {
  position: 'relative',
  width: 900,
  height: 946,
  alignItems: 'flex-start',
},

boardBackground: {
  width: 900,
  height: 946,
  position: 'relative',
  overflow: 'hidden',
},

boardImageCell: {
  position: 'absolute',

  width: '15.5%',
  height: '21.2%',

  borderRadius: 14,

  alignItems: 'center',
  justifyContent: 'center',

  padding: 0,
},

selectedImageCell: {
  borderWidth: 4,
  borderColor: '#FFD700',
},

imageCellLabel: {
  position: 'absolute',
  top: 4,
  left: 4,

  zIndex: 10,

  color: '#FFFFFF',
  fontSize: 9,
  fontWeight: 'bold',

  backgroundColor:
    'rgba(0, 0, 0, 0.75)',

  paddingHorizontal: 4,
  paddingVertical: 2,

  borderRadius: 4,
},

pokemonOnBoard: {
  width: '92%',
  marginTop: 12,
  padding: 8,

  backgroundColor:
    'rgba(10, 10, 10, 0.88)',

  borderRadius: 10,
  borderWidth: 1,
  borderColor:
    'rgba(255, 255, 255, 0.35)',

  alignItems: 'center',
},

boardPokemonName: {
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: 13,
  textAlign: 'center',
  marginBottom: 3,
},

boardPokemonHp: {
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: 'bold',
  marginBottom: 4,
},

hpBar: {
  width: '90%',
  height: 7,
  backgroundColor:
    'rgba(255,255,255,0.2)',
  borderRadius: 5,
  overflow: 'hidden',
  marginBottom: 6,
},

hpBarFill: {
  height: '100%',
  backgroundColor: '#4CAF50',
  borderRadius: 5,
},

boardPokemonInfo: {
  color: '#FFFFFF',
  fontSize: 10,
  textAlign: 'center',
  marginTop: 2,
},

statusContainer: {
  marginTop: 4,
  alignItems: 'center',
},

boardStatusText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: 'bold',
  textAlign: 'center',
},

boardAttackedText: {
  color: '#FFD54F',
  fontSize: 10,
  fontWeight: 'bold',
  marginTop: 5,
},

miniPokemonCard: {
  width: '100%',
  height: '100%',

  backgroundColor: '#E8E8E8',

  borderWidth: 3,
  borderColor: '#D4AF37',

  borderRadius: 14,

  overflow: 'hidden',
  alignItems: 'center',

  position: 'relative',
},

miniCardHeader: {
  width: '100%',
  height: 22,

  flexDirection: 'row',
  alignItems: 'center',

  paddingHorizontal: 4,

  backgroundColor: '#D8D8D8',
},

miniCardStageBadge: {
  color: '#222222',
  fontSize: 6,
  fontWeight: 'bold',

  backgroundColor: '#BBBBBB',

  paddingHorizontal: 4,
  paddingVertical: 2,

  borderRadius: 4,

  marginRight: 4,
},

miniCardName: {
  flex: 1,

  color: '#111111',
  fontSize: 9,
  fontWeight: 'bold',
},

miniHpBar: {
  width: '92%',
  height: 12,

  backgroundColor: '#AAAAAA',

  borderRadius: 6,
  overflow: 'hidden',

  justifyContent: 'center',
},

miniCardArtwork: {
  width: '90%',
  height: '34%',
  marginTop: 4,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#888888',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
},

miniCardAttacks: {
  width: '92%',
  marginTop: 4,
  paddingHorizontal: 3,
  paddingVertical: 2,
  position: 'relative',
  overflow: 'hidden',
},

attackTypeWatermark: {
  position: 'absolute',
  right: 4,
  top: 2,
  fontSize: 38,
  opacity: 0.12,
},

miniCardTypeIcon: {
  fontSize: 22,
},

miniCardArtworkName: {
  color: '#333333',
  fontSize: 7,
  fontWeight: 'bold',
},


miniAttackName: {
  flex: 1,
  color: '#111111',
  fontSize: 6,
  fontWeight: 'bold',
},

miniAttackDamage: {
  color: '#111111',
  fontSize: 7,
  fontWeight: 'bold',
  marginLeft: 3,
},

miniCardBottom: {
  width: '92%',

  flexDirection: 'row',
  justifyContent: 'space-between',

  marginTop: 2,
},

miniCardEnergy: {
  flex: 1,

  color: '#111111',
  fontSize: 6,
},

miniCardRetreat: {
  color: '#111111',
  fontSize: 6,
  fontWeight: 'bold',
},

miniCardStatuses: {
  fontSize: 8,
  marginTop: 2,
},

miniCardAttacked: {
  color: '#B00000',
  fontSize: 6,
  fontWeight: 'bold',
  marginTop: 1,
},

miniAttackRow: {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 1,
},

miniAttackEffect: {
  color: '#333333',
  fontSize: 5.5,
  lineHeight: 7,
  marginTop: 1,
  paddingHorizontal: 2,
},

miniAttackBlock: {
  width: '100%',
  borderTopWidth: 1,
  borderTopColor: '#AAAAAA',
  paddingVertical: 2,
},

headerHpBar: {
  width: 55,
  height: 12,

  backgroundColor: '#AAAAAA',

  borderRadius: 6,
  overflow: 'hidden',

  justifyContent: 'center',

  marginLeft: 4,
},

headerHpBarFill: {
  height: '100%',

  backgroundColor: '#39A845',
},

headerHpText: {
  position: 'absolute',

  width: '100%',

  color: '#FFFFFF',
  fontSize: 6,
  fontWeight: 'bold',

  textAlign: 'center',
},

miniCardArtworkImage: {
  width: '100%',
  height: '100%',
},
});

type PokemonBoardCardProps = {
  pokemon: PokemonInPlay;
  onToolPress?: () => void;
};


function PokemonBoardCard({
  pokemon,
  onToolPress,
}: PokemonBoardCardProps) {
  const effectiveMaxHp =
  getPokemonMaxHp(pokemon);

const hpPercent = Math.max(
  0,
  Math.min(
    100,
    (pokemon.currentHp /
      effectiveMaxHp) *
      100
  )
);

  const hpWidth =
    `${hpPercent}%` as `${number}%`;

  const colors = getTypeCardColors(
    pokemon.card.type
  );

  const statusIcons = [
    pokemon.poisoned ? '☠️' : '',
    pokemon.burned ? '🔥' : '',
    pokemon.paralyzed ? '⚡' : '',
    pokemon.confused ? '🌀' : '',
    pokemon.asleep ? '😴' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View
  style={[
    styles.miniPokemonCard,

    {
      backgroundColor:
        colors.card,

      borderColor:
  pokemon.card.variant === 'gx'
    ? '#C0C0C0'
    : colors.border,

    },
  ]}
>

      {/* PETIT OUTIL ATTACHÉ */}
{pokemon.attachedTool && (
  <Pressable
    style={
      styles.attachedToolThumbnail
    }
    onPress={(event) => {
      event.stopPropagation();
      onToolPress?.();
    }}
  >
    {pokemon.attachedTool.artwork ? (
      <Image
        source={
          pokemon.attachedTool.artwork
        }
        style={
          styles.attachedToolThumbnailImage
        }
        resizeMode="cover"
      />
    ) : (
      <Text
        style={
          styles.attachedToolThumbnailFallback
        }
      >
        🛠
      </Text>
    )}
  </Pressable>
)}
      {/* HAUT DE LA CARTE */}
      <View
        style={[
          styles.miniCardHeader,
          {
            backgroundColor: colors.header,
          },
        ]}
      >
        <View style={styles.miniCardHeaderLeft}>

  {/* NIVEAU D'ÉVOLUTION */}
  <Text
    style={styles.miniCardStageBadge}
  >
    {getStageName(
      pokemon.card.stage
    )}
  </Text>

  {/* NOM DU POKÉMON EN DESSOUS */}
  <View style={styles.miniCardNameRow}>
    <Text
      style={styles.miniCardName}
      numberOfLines={1}
    >
      {pokemon.card.variant === 'gx'
        ? pokemon.card.name.replace(
            /\s*-?\s*gx$/i,
            ''
          )
        : pokemon.card.name}
    </Text>

    {pokemon.card.variant === 'gx' && (
      <Text style={styles.gxNameText}>
        {' '}GX
      </Text>
    )}
  </View>

</View>

        {/* PV EN HAUT À DROITE */}
        <View style={styles.headerHpBar}>
          <View
            style={[
              styles.headerHpBarFill,
              {
                width: hpWidth,
              },
            ]}
          />

          <Text
            style={styles.headerHpText}
          >
            {pokemon.currentHp}/{effectiveMaxHp} PV
          </Text>
        </View>
      </View>

      {/* IMAGE */}
      <View style={styles.miniCardArtwork}>
        {pokemon.card.artwork ? (
          <Image
            source={
              pokemon.card.artwork
            }
            style={
              styles.miniCardArtworkImage
            }
            resizeMode="cover"
          />
        ) : (
          <>
            <Text
              style={
                styles.miniCardTypeIcon
              }
            >
              {getTypeIcon(
                pokemon.card.type
              )}
            </Text>

            <Text
              style={
                styles.miniCardArtworkName
              }
            >
              {pokemon.card.name}
            </Text>
          </>
        )}
      </View>

      
      {/* ATTAQUES */}
      <View
        style={[
          styles.miniCardAttacks,
          {
            backgroundColor:
              colors.attackBg,
          },
        ]}
      >
        {/* LOGO DU TYPE EN ARRIÈRE-PLAN */}
        <Text
          style={
            styles.attackTypeWatermark
          }
        >
          {getTypeIcon(
            pokemon.card.type
          )}
        </Text>

{pokemon.card.talent && (
  <View style={styles.miniAttackBlock}>
    <View style={styles.miniAttackRow}>
      <Text
        style={[
          styles.miniAttackName,
          { color: '#d71920' },
        ]}
      >
        Talent : {pokemon.card.talent.name}
      </Text>
    </View>

    <Text style={styles.miniAttackEffect}>
      {pokemon.card.talent.description}
    </Text>
  </View>
)}

        {pokemon.card.attacks.map(
          (attack, index) => (
            <View
              key={`${attack.name}-${index}`}
              style={
                styles.miniAttackBlock
              }
            >
              <View
                style={
                  styles.miniAttackRow
                }
              >
                <Text
                  style={
                    styles.miniAttackName
                  }
                  numberOfLines={1}
                >
                  {formatAttackCost(
                    attack
                  )}{' '}
                  {attack.name}
                </Text>

                <Text
                  style={
                    styles.miniAttackDamage
                  }
                >
                  {attack.damage}
                </Text>
              </View>

              {attack.effectText && (
                <Text
                  style={
                    styles.miniAttackEffect
                  }
                >
                  {attack.effectText}
                </Text>
              )}
            </View>
          )
        )}
      </View>

      {/* BAS DE CARTE */}
      <View
        style={styles.miniCardBottom}
      >
        <Text
          style={styles.miniCardEnergy}
        >
          Énergies :{' '}
          {formatEnergies(
            pokemon.energies
          ) || '—'}
        </Text>

        <Text
          style={
            styles.miniCardRetreat
          }
        >
          Retraite : ◇
          {pokemon.card.retreatCost}
        </Text>
      </View>

      {/* ÉTATS */}
      {statusIcons.length > 0 && (
        <Text
          style={
            styles.miniCardStatuses
          }
        >
          {statusIcons}
        </Text>
      )}

      {/* ATTAQUE DÉJÀ EFFECTUÉE */}
      {pokemon.hasAttacked && (
        <Text
          style={
            styles.miniCardAttacked
          }
        >
          ✓ Attaque faite
        </Text>
      )}
    </View>
  );
}

type PokemonHandCardProps = {
  card: PokemonCard;
};

function PokemonHandCard({
  card,
}: PokemonHandCardProps) {
  const colors =
    getTypeCardColors(card.type);

  const hpPercent = 100;

  const hpWidth =
    `${hpPercent}%` as `${number}%`;

  return (
    <View
      style={[
        styles.miniPokemonCard,
        {
  backgroundColor:
    colors.card,

  borderColor:
    card.variant === 'gx'
      ? '#C0C0C0'
      : colors.border,
},
      ]}
    >
      {/* HAUT DE LA CARTE */}
      <View
        style={[
          styles.miniCardHeader,
          {
            backgroundColor:
              colors.header,
          },
        ]}
      >
        <View style={styles.miniCardHeaderLeft}>

  {/* NIVEAU D'ÉVOLUTION */}
  <Text
    style={styles.miniCardStageBadge}
  >
    {getStageName(card.stage)}
  </Text>

  {/* NOM DU POKÉMON EN DESSOUS */}
  <View style={styles.miniCardNameRow}>
    <Text
      style={styles.miniCardName}
      numberOfLines={1}
    >
      {card.variant === 'gx'
        ? card.name.replace(
            /\s*-?\s*gx$/i,
            ''
          )
        : card.name}
    </Text>

    {card.variant === 'gx' && (
      <Text style={styles.gxNameText}>
        {' '}GX
      </Text>
    )}
  </View>

</View>

        <View
          style={styles.headerHpBar}
        >
          <View
            style={[
              styles.headerHpBarFill,
              {
                width: hpWidth,
              },
            ]}
          />

          <Text
            style={styles.headerHpText}
          >
            {card.maxHp}/{card.maxHp} PV
          </Text>
        </View>
      </View>

      {/* IMAGE */}
      <View
        style={styles.miniCardArtwork}
      >
        {card.artwork ? (
          <Image
            source={card.artwork}
            style={
              styles.miniCardArtworkImage
            }
            resizeMode="cover"
          />
        ) : (
          <>
            <Text
              style={
                styles.miniCardTypeIcon
              }
            >
              {getTypeIcon(card.type)}
            </Text>

            <Text
              style={
                styles.miniCardArtworkName
              }
            >
              {card.name}
            </Text>
          </>
        )}
      </View>

      {/* ATTAQUES */}
      <View
        style={[
          styles.miniCardAttacks,
          {
            backgroundColor:
              colors.attackBg,
          },
        ]}
      >
        <Text
          style={
            styles.attackTypeWatermark
          }
        >
          {getTypeIcon(card.type)}
        </Text>

{card.talent && (
  <View style={styles.miniAttackBlock}>
    <View style={styles.miniAttackRow}>
      <Text
        style={[
          styles.miniAttackName,
          { color: '#d71920' },
        ]}
      >
        Talent : {card.talent.name}
      </Text>
    </View>

    <Text style={styles.miniAttackEffect}>
      {card.talent.description}
    </Text>
  </View>
)}

        {card.attacks.map(
          (attack, index) => (
            <View
              key={`${attack.name}-${index}`}
              style={
                styles.miniAttackBlock
              }
            >
              <View
                style={
                  styles.miniAttackRow
                }
              >
                <Text
                  style={
                    styles.miniAttackName
                  }
                  numberOfLines={1}
                >
                  {formatAttackCost(
                    attack
                  )}{' '}
                  {attack.name}
                </Text>

                <Text
                  style={
                    styles.miniAttackDamage
                  }
                >
                  {attack.damage}
                </Text>
              </View>

              {attack.effectText && (
                <Text
                  style={
                    styles.miniAttackEffect
                  }
                >
                  {attack.effectText}
                </Text>
              )}
            </View>
          )
        )}
      </View>

      {/* BAS DE LA CARTE */}
      <View
        style={styles.miniCardBottom}
      >
        <Text
          style={
            styles.miniCardEnergy
          }
        >
          Type :{' '}
          {getTypeIcon(card.type)}
        </Text>

        <Text
          style={
            styles.miniCardRetreat
          }
        >
          Retraite : ◇
          {card.retreatCost}
        </Text>
      </View>
    </View>
  );
}

function getTrainerCategoryLabel(
  card: TrainerCard
) {
  return card.category === 'objet'
    ? 'Objet'
    : 'Supporter';
}

function isPokemonTool(
  card: TrainerCard
) {
  return (
    card.category === 'objet' &&
    card.subtype === 'outil'
  );
}

type TrainerHandCardProps = {
  card: TrainerCard;
  disabled: boolean;
  isSelected: boolean;
  onPress: () => void;
};

function TrainerHandCard({
  card,
  disabled,
  isSelected,
  onPress,
}: TrainerHandCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.trainerCard,
        disabled &&
          styles.disabledCard,
        isSelected &&
          styles.selectedCard,
      ]}
    >
      {/* DRESSEUR | OBJET */}
      <View
        style={
          styles.trainerTopHeader
        }
      >
        <Text
          style={
            styles.trainerHeaderLeft
          }
        >
          DRESSEUR
        </Text>

        <Text
          style={
            styles.trainerHeaderSeparator
          }
        >
          |
        </Text>

        <Text
          style={
            styles.trainerHeaderRight
          }
        >
          {card.category === 'objet'
            ? 'Objet'
            : 'Supporter'}
        </Text>
      </View>

      {/* NOM DE LA CARTE */}
      <View
        style={styles.trainerNameBar}
      >
        <Text
          style={
            styles.trainerCardName
          }
          numberOfLines={1}
        >
          {card.name}
        </Text>
      </View>

      {/* IMAGE */}
      <View
        style={
          styles.trainerArtworkFrame
        }
      >
        {card.artwork ? (
          <Image
            source={card.artwork}
            style={
              styles.trainerArtworkImage
            }
            resizeMode="cover"
          />
        ) : (
          <Text
            style={
              styles.trainerArtworkPlaceholder
            }
          >
            {card.name}
          </Text>
        )}
      </View>

      {/* OUTIL POKÉMON */}
      {card.subtype === 'outil' && (
        <View
          style={
            styles.trainerToolBar
          }
        >
          <Text
            style={
              styles.trainerToolText
            }
          >
            Outil Pokémon
          </Text>
        </View>
      )}

      {/* DESCRIPTION */}
      <View
        style={
          styles.trainerDescriptionBox
        }
      >
        <Text
          style={
            styles.trainerDescription
          }
        >
          {card.description}
        </Text>
      </View>
    </Pressable>
  );
}

function PlayerTargetCard({
  player,
  damage,
  status,
  onPress,
  selectable,
}: {
  player: Player;
  damage: number;
  status: PlayerStatusState;
  onPress: () => void;
  selectable: boolean;
}) {

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.handPokemonPressable,
        styles.playerTargetCard,

        selectable &&
          styles.playerTargetCardSelectable,
      ]}
    >
      <Text
        style={styles.playerTargetName}
      >
        JOUEUR {player}
      </Text>

     <Text style={styles.playerTargetHp}>
  PV : ∞
</Text>

<Text style={styles.playerTargetDamage}>
  Dégâts reçus : {damage}
</Text>

      {status.poisoned && (
        <Text
          style={styles.playerTargetStatus}
        >
          ☠️ Poison
        </Text>
      )}

      {status.burned && (
        <Text
          style={styles.playerTargetStatus}
        >
          🔥 Brûlure
        </Text>
      )}

      {status.extraDamageNextTurnReady && (
        <Text
          style={styles.playerTargetStatus}
        >
          🎯 +
          {status.extraDamageNextTurn}
          {' '}dégâts
        </Text>
      )}
    </Pressable>
  );
}

function getPassiveEnergyLimit(
  card: PokemonCard
): number {
  if (card.attacks.length === 0) {
    return 0;
  }

  return Math.max(
    ...card.attacks.map(
      (attack) => attack.energyCost
    )
  );
}

export default function HomeScreen() {
  const { width: screenWidth } =
  useWindowDimensions();

const isTablet =
  Platform.OS !== 'web' &&
  screenWidth >= 600;

const setupPokemonPerRow =
  isTablet ? 5 : 7;

  const columns = [1, 2, 3, 4];
  const rows = ['A', 'B', 'C', 'D'];

  const boardCells = [
  'A1', 'A2', 'A3', 'A4',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4',
  'D1', 'D2', 'D3', 'D4',
];

function getSetupCounts(
  cards: GameCard[]
) {
  const pokemonCount =
    cards.filter(
      (card) =>
        isPokemonCard(card)
    ).length;

  const objectCount =
    cards.filter(
      (card) =>
        !isPokemonCard(card) &&
        card.category === 'objet'
    ).length;

  const supporterCount =
    cards.filter(
      (card) =>
        !isPokemonCard(card) &&
        card.category === 'supporter'
    ).length;

  return {
    pokemonCount,
    objectCount,
    supporterCount,
  };
}

function toggleSetupCard(
  card: GameCard
) {
  if (
    setupPhase === 'battle'
  ) {
    return;
  }

  const currentCards =
    setupPhase === 'player1'
      ? player1SetupCards
      : player2SetupCards;

  const setCards =
    setupPhase === 'player1'
      ? setPlayer1SetupCards
      : setPlayer2SetupCards;

  const alreadySelected =
    currentCards.some(
      (selectedCard) =>
        selectedCard.id === card.id
    );

  // Si déjà sélectionnée :
  // on la retire.
  if (alreadySelected) {
    setCards(
      currentCards.filter(
        (selectedCard) =>
          selectedCard.id !== card.id
      )
    );

    return;
  }

  const {
    pokemonCount,
    objectCount,
    supporterCount,
  } =
    getSetupCounts(
      currentCards
    );

  // -----------------------------
  // POKÉMON
  // -----------------------------

  if (isPokemonCard(card)) {
    if (pokemonCount >= 8) {
      setMessage(
        'Tu as déjà choisi tes 8 Pokémon.'
      );

      return;
    }
  }

  // -----------------------------
  // OBJETS
  // -----------------------------

  else if (
    card.category === 'objet'
  ) {
    if (objectCount >= 3) {
      setMessage(
        'Tu as déjà choisi tes 3 Objets.'
      );

      return;
    }
  }

  // -----------------------------
  // SUPPORTERS
  // -----------------------------

  else if (
    card.category ===
    'supporter'
  ) {
    if (supporterCount >= 2) {
      setMessage(
        'Tu as déjà choisi tes 2 Supporters.'
      );

      return;
    }
  }

  setCards([
    ...currentCards,
    card,
  ]);
}

function confirmSetupSelection() {
  if (
    setupPhase === 'battle'
  ) {
    return;
  }

  const cards =
    setupPhase === 'player1'
      ? player1SetupCards
      : player2SetupCards;

  const {
    pokemonCount,
    objectCount,
    supporterCount,
  } =
    getSetupCounts(cards);

  // Vérifie que la main contient
  // exactement 8 Pokémon,
  // 3 Objets et 2 Supporters.
  if (
    pokemonCount !== 8 ||
    objectCount !== 3 ||
    supporterCount !== 2
  ) {
    setMessage(
      `Il faut exactement 8 Pokémon, 3 Objets et 2 Supporters. Actuellement : ${pokemonCount}/8 Pokémon, ${objectCount}/3 Objets, ${supporterCount}/2 Supporters.`
    );

    return;
  }

  // =================================
  // INVOCATION DUO
  // =================================

  // Vérifie si le joueur a choisi
  // le nouveau Supporter.
  const hasInvocationSupporter =
    cards.some(
      (card) =>
        !isPokemonCard(card) &&
        card.effect ===
          'summonTwoBase60'
    );

  // =============================
  // JOUEUR 1 TERMINÉ
  // =============================

  if (
    setupPhase === 'player1'
  ) {
    // Enregistre d'abord les
    // 13 cartes de la main.
    setPlayer1Hand([
      ...cards,
    ]);

    // Si Invocation Duo est présent,
    // on NE passe PAS encore au J2.
    // On ouvre d'abord le choix
    // des 2 Pokémon Invocation.
    if (
      hasInvocationSupporter
    ) {
      setPlayer1InvocationCards(
        []
      );

      setInvocationSetupPlayer(
        1
      );

      setMessage(
        'Joueur 1 : choisis 2 Pokémon de Base ayant 60 PV ou moins pour Invocation Duo.'
      );

      return;
    }

    // Sinon fonctionnement normal :
    // on passe directement au J2.
    setSetupPhase(
      'player2'
    );

    setMessage(
      'Main du joueur 1 enregistrée. Joueur 2 : choisis maintenant tes cartes.'
    );

    return;
  }

  // =============================
  // JOUEUR 2 TERMINÉ
  // =============================

  // Enregistre les 13 cartes du J2.
  setPlayer2Hand([
    ...cards,
  ]);

  // Si le J2 possède Invocation Duo,
  // on choisit d'abord ses
  // 2 Pokémon Invocation.
  if (
    hasInvocationSupporter
  ) {
    setPlayer2InvocationCards(
      []
    );

    setInvocationSetupPlayer(
      2
    );

    setMessage(
      'Joueur 2 : choisis 2 Pokémon de Base ayant 60 PV ou moins pour Invocation Duo.'
    );

    return;
  }

  // Sinon la partie commence
  // normalement.
  setSetupPhase(
    'battle'
  );

  setCurrentPlayer(1);
  setRound(1);

  setMessage(
    'Les deux joueurs ont choisi leurs cartes. Début de la partie : tour du joueur 1.'
  );
}

const boardRowPositions: Record<
  string,
  `${number}%`
> = {
  A: '2.3%',
  B: '25.9%',
  C: '56.2%',
  D: '79.2%',
};

const boardColumnPositions: Record<
  string,
  `${number}%`
> = {
  '1': '10.5%',
  '2': '31.2%',
  '3': '51.5%',
  '4': '72.2%',
};

  const [board, setBoard] = useState<BoardState>(() =>
    createEmptyBoard()
  );

  const [currentPlayer, setCurrentPlayer] =
    useState<Player>(1);

  const [round, setRound] = useState(1);

  const [selectedCard, setSelectedCard] =
    useState<PokemonCard | null>(null);

  const [selectedTrainerCard, setSelectedTrainerCard] =
  useState<TrainerCard | null>(null);

  const [selectedTrainerOwner,setSelectedTrainerOwner,] =
  useState<Player | null>(null);

  const [selectedPokemonCell, setSelectedPokemonCell] =
    useState<string | null>(null);

  const [selectedAttackIndex, setSelectedAttackIndex] =
  useState<number | null>(null);

  const [hasPlacedThisTurn, setHasPlacedThisTurn] =
    useState(false);

  const [
  pendingBenchEnergyAttachment,
  setPendingBenchEnergyAttachment,
] =
  useState<PendingBenchEnergyAttachment | null>(
    null
  );

  const [hasUsedSupporterThisTurn, setHasUsedSupporterThisTurn] =
  useState(false);

  const [
  selectedAttachedTool,
  setSelectedAttachedTool,
] = useState<{
  card: TrainerCard;
  cellName: string;
} | null>(null);

const [
  pendingOpponentActiveSwitch,
  setPendingOpponentActiveSwitch,
] = useState<
  PendingOpponentActiveSwitch | null
>(null);

const [
  pendingGeneratedBenchEnergy,
  setPendingGeneratedBenchEnergy,
] = useState<
  PendingGeneratedBenchEnergy | null
>(null);

const [
  openedDiscardPlayer,
  setOpenedDiscardPlayer,
] = useState<Player | null>(null);

const [
  pendingInvocationPlacement,
  setPendingInvocationPlacement,
] =
  useState<
    PendingInvocationPlacement | null
  >(null);

const [
  setupPhase,
  setSetupPhase,
] = useState<SetupPhase>(
  'player1'
);

const [
  player1SetupCards,
  setPlayer1SetupCards,
] = useState<GameCard[]>([]);

const [
  player1InvocationCards,
  setPlayer1InvocationCards,
] = useState<PokemonCard[]>([]);

const [
  player2InvocationCards,
  setPlayer2InvocationCards,
] = useState<PokemonCard[]>([]);

const [
  invocationSetupPlayer,
  setInvocationSetupPlayer,
] = useState<Player | null>(null);

function addInvocationSetupCard(
  card: PokemonCard
) {
  if (!invocationSetupPlayer) {
    return;
  }

  const setter =
    invocationSetupPlayer === 1
      ? setPlayer1InvocationCards
      : setPlayer2InvocationCards;

  setter((previous) => {
    if (previous.length >= 2) {
      return previous;
    }

    return [
      ...previous,
      card,
    ];
  });
}

function removeInvocationSetupCard(
  index: number
) {
  if (!invocationSetupPlayer) {
    return;
  }

  const setter =
    invocationSetupPlayer === 1
      ? setPlayer1InvocationCards
      : setPlayer2InvocationCards;

  setter((previous) =>
    previous.filter(
      (_, cardIndex) =>
        cardIndex !== index
    )
  );
}

const [
  pendingKOSurvival,
  setPendingKOSurvival,
] = useState<
  PendingKOSurvival | null
>(null);

const [
  player2SetupCards,
  setPlayer2SetupCards,
] = useState<GameCard[]>([]);

const [
  pendingCoinReturnToHand,
  setPendingCoinReturnToHand,
] = useState<
  PendingCoinReturnToHand | null
>(null);

const [
  pendingBothPlayersSwitch,
  setPendingBothPlayersSwitch,
] = useState<
  PendingBothPlayersSwitch | null
>(null);

const [
  pendingKOEnergyMove,
  setPendingKOEnergyMove,
] = useState<
  PendingKOEnergyMove | null
>(null);

const [
  pokemonPlacementLocks,
  setPokemonPlacementLocks,
] = useState<
  Record<string, number>
>({});

  const [
  pendingSleepResolution,
  setPendingSleepResolution,
] = useState<PendingSleepResolution | null>(
  null
);

  const [
  hasAttackedThisTurn,
  setHasAttackedThisTurn,
] = useState(false);

const [
  pendingOpponentTarget,
  setPendingOpponentTarget,
] =
  useState<PendingOpponentTarget | null>(
    null
  );

const [
  remainingAttackPaths,
  setRemainingAttackPaths,
] = useState<AttackPath[]>([]);

  const [
  pendingAttackAfterCoin,
  setPendingAttackAfterCoin,
] = useState<CoinAttackReference | null>(
  null
);

const [
  readyCoinAttack,
  setReadyCoinAttack,
] = useState<CoinAttackReference | null>(
  null
);

const [
  pendingPokemonSwitch,
  setPendingPokemonSwitch,
] = useState<PendingPokemonSwitch | null>(
  null
);

  const [player1Hand, setPlayer1Hand] =
  useState<GameCard[]>([
    pikachu,
    Necrozmagx,
    reptincel,
    DracaufeuGx,
    boumata,
    denticrisse,
    rafflesia,
    noctunoir,

    potion,
    corde_sortie,
    haltère,

    kiawe,
    margie,
  ]);

const [player2Hand, setPlayer2Hand] =
  useState<GameCard[]>([
    cradopaud,
    frison,
    mackogneurgx,
    persian,
    hyporoi,
    chenipan,
    flamoutan,
    tokopiscogx,

    relais,
    super_rappel,
   

    nephie,
    guzma,
  ]);

const [player1Discard, setPlayer1Discard] =
  useState<GameCard[]>([]);

const [player2Discard, setPlayer2Discard] =
  useState<GameCard[]>([]);

const [player1DiscardEnergies, setPlayer1DiscardEnergies] =
  useState<EnergyType[]>([]);

const [player2DiscardEnergies, setPlayer2DiscardEnergies] =
  useState<EnergyType[]>([]);
  
const [player1Damage, setPlayer1Damage] =
    useState(0);

const [player2Damage, setPlayer2Damage] =
    useState(0);

const [
  player1CoinConstraints,
  setPlayer1CoinConstraints,
] = useState<CoinConstraintQueues>({});

const [
  player2CoinConstraints,
  setPlayer2CoinConstraints,
] = useState<CoinConstraintQueues>({});

const [
  trainerCoinHistories,
  setTrainerCoinHistories,
] = useState<Record<string, CoinHistory>>({});

const [player1Status, setPlayer1Status] =
  useState<PlayerStatusState>(
    createNormalPlayerStatus()
  );

const [player2Status, setPlayer2Status] =
  useState<PlayerStatusState>(
    createNormalPlayerStatus()
  );

const [
  trainerEffectActivated,
  setTrainerEffectActivated,
] = useState(false);


const [gameOver, setGameOver] =
    useState(false);

const [message, setMessage] = useState(
    'Tour du joueur 1 : sélectionne Pikachu.'
  );

const [
  pendingCoinFlip,
  setPendingCoinFlip,
] = useState<PendingCoinFlip | null>(null);

const [
  turnId,
  setTurnId,
] = useState(1);

const [
  coinDraft,
  setCoinDraft,
] = useState<(CoinSide | null)[]>([]);

function handlePlayerTargetPress(
  targetPlayer: Player
) {
  if (!pendingOpponentTarget) {
    return;
  }

  // Impossible de viser son propre joueur
  if (
    targetPlayer ===
    pendingOpponentTarget.player
  ) {
    setMessage(
      'Tu dois choisir le joueur adverse.'
    );

    return;
  }

  const currentDamage =
    targetPlayer === 1
      ? player1Damage
      : player2Damage;

  // Première nouvelle attaque :
  // la cible doit déjà être blessée.
  if (
    pendingOpponentTarget.mode ===
      'damagedOpponentOrPlayer' &&
    currentDamage <= 0
  ) {
    setMessage(
      `Le joueur ${targetPlayer} n'a aucun marqueur de dégâts.`
    );

    return;
  }

  const targetStatus =
    targetPlayer === 1
      ? player1Status
      : player2Status;

  const extraDamage =
    targetStatus
      .extraDamageNextTurnReady &&
    targetStatus
      .extraDamageNextTurnSourcePlayer ===
      pendingOpponentTarget.player
      ? targetStatus
          .extraDamageNextTurn ?? 0
      : 0;

  const finalDamage =
    pendingOpponentTarget.damage +
    extraDamage;

  if (targetPlayer === 1) {
    setPlayer1Damage(
      (damage) =>
        damage + finalDamage
    );
  } else {
    setPlayer2Damage(
      (damage) =>
        damage + finalDamage
    );
  }

  setMessage(
    `Le joueur ${targetPlayer} subit ${finalDamage} dégâts.`
  );

  setPendingOpponentTarget(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);
}

function canSelectPlayerTarget(
  player: Player
): boolean {
  if (!pendingOpponentTarget) {
    return false;
  }

  if (
    player ===
    pendingOpponentTarget.player
  ) {
    return false;
  }

  if (
    pendingOpponentTarget.mode ===
      'damagedOpponentOrPlayer'
  ) {
    const damage =
      player === 1
        ? player1Damage
        : player2Damage;

    return damage > 0;
  }

  return true;
}

function startBenchOrPlayerDamageTarget(
  attacker: PokemonInPlay,
  attackerCell: string,
  attack: Attack,
  mainTargetCell: string | null
): boolean {
  const secondaryDamage =
    attack
      .secondaryBenchOrPlayerDamage
      ?? 0;

  if (secondaryDamage <= 0) {
    return false;
  }

  setPendingOpponentTarget({
    player: attacker.owner,

    attackerCell,

    damage: secondaryDamage,

    mode: 'benchOrPlayer',

    excludedCell:
      mainTargetCell,
  });

  return true;
}

function getBaseAttackBlocker(
  attackerCell: string
): PokemonInPlay | null {
  const attacker =
    board[attackerCell];

  if (!attacker) {
    return null;
  }

  // Seuls les Pokémon de Base
  // sont concernés
  if (
    attacker.card.stage !== 'base'
  ) {
    return null;
  }

  // Numéro de colonne de l'attaquant
  // Ex : C1 -> "1"
  const attackerColumn =
    attackerCell.substring(1);

  for (
    const [talentCell, talentPokemon]
    of Object.entries(board)
  ) {
    if (!talentPokemon) {
      continue;
    }

    // Le Talent doit appartenir
    // au joueur adverse
    if (
      talentPokemon.owner ===
      attacker.owner
    ) {
      continue;
    }

    // Vérifie le bon Talent passif
    if (
      talentPokemon.card.talent?.type !==
        'passive' ||
      talentPokemon.card.talent.effect !==
        'blockBaseAttacks'
    ) {
      continue;
    }

    // Numéro de colonne du Pokémon
    // possédant le Talent
    const talentColumn =
      talentCell.substring(1);

    // Le Talent agit uniquement
    // dans la même colonne
    if (
      talentColumn === attackerColumn
    ) {
      return talentPokemon;
    }
  }

  return null;
}

  function handleHandCardPress(
  card: GameCard,
  owner: Player
) {
  if (gameOver) {
    return;
  }

  if (owner !== currentPlayer) {

  // L'adversaire peut consulter
  // Invocation Duo, mais pas l'utiliser.
  if (
    !isPokemonCard(card) &&
    card.effect ===
      'summonTwoBase60'
  ) {
    setSelectedCard(null);

    setSelectedPokemonCell(
      null
    );

    setSelectedAttackIndex(
      null
    );

    setSelectedAttachedTool(
      null
    );

    setSelectedTrainerCard(
      card
    );

    setSelectedTrainerOwner(
      owner
    );

    setTrainerEffectActivated(
      false
    );

    setMessage(
      `Invocation Duo du joueur ${owner}. Tu peux consulter ses Invocations, mais pas activer la carte.`
    );

    return;
  }

  setMessage(
    `C'est au joueur ${currentPlayer} de jouer.`
  );

  return;
}

  if (
  !isPokemonCard(card) &&
  card.category === 'supporter' &&
  hasUsedSupporterThisTurn
) {
  setMessage(
    'Tu as déjà utilisé une carte Supporter pendant ce tour.'
  );
  return;
}

  // Pokémon
  if (isPokemonCard(card)) {
    setSelectedTrainerCard(null);
    setSelectedTrainerOwner(
  null
);
    setTrainerEffectActivated(false);
    selectCard(card, owner);
    return;
  }

  // Carte Dresseur
  setSelectedCard(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);
  setSelectedTrainerCard(card);
  setSelectedTrainerOwner(
  owner
);
  setTrainerEffectActivated(false);

  if (card.effect === 'heal30'||
  card.effect === 'heal20') {
    setMessage(
      `${card.name} sélectionnée. Choisis maintenant un de tes Pokémon à soigner.`
    );
  } else {
    setMessage(
      `${card.name} : son effet n'est pas encore programmé.`
    );
  }
}

function hasHorizontalPartner(
  boardToCheck: BoardState,
  player: Player,
  cellName: string
): boolean {
  const pokemonToCheck =
    boardToCheck[cellName];

  // Une Invocation ne peut jamais
  // participer à un échange Dresseur.
  if (
    !pokemonToCheck ||
    pokemonToCheck.owner !== player ||
    pokemonToCheck.isInvocation
  ) {
    return false;
  }

  const row = cellName[0];

  return Object.entries(
    boardToCheck
  ).some(
    ([otherCell, pokemon]) =>
      otherCell !== cellName &&
      otherCell[0] === row &&
      pokemon !== null &&
      pokemon.owner === player &&
      !pokemon.isInvocation
  );
}

function playerCanSwitchHorizontally(
  boardToCheck: BoardState,
  player: Player
): boolean {
  return Object.entries(
    boardToCheck
  ).some(
    ([cellName, pokemon]) =>
      pokemon !== null &&
      pokemon.owner === player &&
      !pokemon.isInvocation &&
      hasHorizontalPartner(
        boardToCheck,
        player,
        cellName
      )
  );
}
function createAttackPaths(
  startCell: string,
  player: Player
): AttackPath[] {
  const row = startCell[0];
  const column =
    Number(startCell.slice(1));

  const frontRow =
    player === 1 ? 'B' : 'C';

  const backRow =
    player === 1 ? 'A' : 'D';

  const makeColumnCells = (
    col: number
  ): string[] => {
    // Si on commence déjà sur la ligne arrière,
    // la ligne avant de cette colonne est perdue.
    if (
      col === column &&
      row === backRow
    ) {
      return [`${backRow}${col}`];
    }

    return [
      `${frontRow}${col}`,
      `${backRow}${col}`,
    ];
  };

  const leftPath: string[] = [];
  const rightPath: string[] = [];

  // Colonne de départ
  leftPath.push(
    ...makeColumnCells(column)
  );

  rightPath.push(
    ...makeColumnCells(column)
  );

  // Vers la gauche
  for (
    let col = column - 1;
    col >= 1;
    col--
  ) {
    leftPath.push(
      `${frontRow}${col}`,
      `${backRow}${col}`
    );
  }

  // Vers la droite
  for (
    let col = column + 1;
    col <= 4;
    col++
  ) {
    rightPath.push(
      `${frontRow}${col}`,
      `${backRow}${col}`
    );
  }

  // Retirer tout ce qui se trouve
  // avant la vraie case de départ.
  const cleanPath = (
    path: string[]
  ) => {
    const startIndex =
      path.indexOf(startCell);

    return path.slice(startIndex);
  };

  return [
    cleanPath(leftPath),
    cleanPath(rightPath),
  ];
}

function canAttackInCurrentOrder(
  cellName: string
): boolean {
  // Personne n'a encore attaqué :
  // n'importe quel Pokémon peut commencer.
  if (
    remainingAttackPaths.length === 0
  ) {
    return true;
  }

  return remainingAttackPaths.some(
    (path) =>
      path.includes(cellName)
  );
}

function advanceAttackOrder(
  cellName: string,
  player: Player
) {
  // Première attaque du tour
  if (
    remainingAttackPaths.length === 0
  ) {
    const paths =
      createAttackPaths(
        cellName,
        player
      );

    const nextPaths =
      paths.map((path) => {
        const index =
          path.indexOf(cellName);

        return path.slice(
          index + 1
        );
      });

    setRemainingAttackPaths(
      nextPaths
    );

    return;
  }

  const nextPaths =
    remainingAttackPaths
      .filter((path) =>
        path.includes(cellName)
      )
      .map((path) => {
        const index =
          path.indexOf(cellName);

        // Tout ce qui était avant
        // est définitivement sauté.
        return path.slice(
          index + 1
        );
      });

  setRemainingAttackPaths(
    nextPaths
  );
}

function activateSelectedTrainerCard() {
  if (!selectedTrainerCard) {
    return;
  }

  if (hasAttackedThisTurn) {
    setMessage(
      "Tu ne peux plus jouer de carte Dresseur après avoir attaqué."
    );
    return;
  }

  if (
  selectedTrainerCard.effect ===
  'healWaterEnergy50'
) {
  // Un seul Supporter par tour
  if (hasUsedSupporterThisTurn) {
    setMessage(
      'Tu as déjà utilisé une carte Supporter pendant ce tour.'
    );

    return;
  }

  // Cherche tous les Pokémon du joueur
  // qui ont au moins 1 Énergie Eau
  // ET qui ont des dégâts à soigner.
  const pokemonToHeal =
    Object.entries(board).filter(
      ([, pokemon]) => {
        if (!pokemon) {
          return false;
        }

        if (
          pokemon.owner !==
          currentPlayer
        ) {
          return false;
        }

        if (
          !pokemon.energies.includes(
            'eau'
          )
        ) {
          return false;
        }

        const maxHp =
          getPokemonMaxHp(pokemon);

        return (
          pokemon.currentHp <
          maxHp
        );
      }
    );

  // Aucun Pokémon valable :
  // la carte n'est pas utilisée.
  if (pokemonToHeal.length === 0) {
    setMessage(
      'Aucun de tes Pokémon avec une Énergie Eau attachée n’a de dégâts à soigner.'
    );

    return;
  }

  const newBoard: BoardState = {
    ...board,
  };

  const healedPokemonNames:
    string[] = [];

  pokemonToHeal.forEach(
    ([cellName, pokemon]) => {
      if (!pokemon) {
        return;
      }

      const maxHp =
        getPokemonMaxHp(pokemon);

      const newHp =
        Math.min(
          pokemon.currentHp + 50,
          maxHp
        );

      const actualHeal =
        newHp -
        pokemon.currentHp;

      newBoard[cellName] = {
        ...pokemon,
        currentHp: newHp,
      };

      healedPokemonNames.push(
        `${pokemon.card.name} (+${actualHeal} PV)`
      );
    }
  );

  setBoard(newBoard);

  // -----------------------------
  // SUPPORTER -> DÉFAUSSE
  // -----------------------------

  if (currentPlayer === 1) {
    setPlayer1Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            selectedTrainerCard.id
        )
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  } else {
    setPlayer2Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            selectedTrainerCard.id
        )
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  }

  setHasUsedSupporterThisTurn(
    true
  );

  setSelectedTrainerCard(null);

  setTrainerEffectActivated(
    false
  );

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `Soin Aquatique : ${healedPokemonNames.join(
      ', '
    )}.`
  );

  return;
}

if (
  selectedTrainerCard.effect ===
  'attach2FireEndTurn'
) {
  if (hasUsedSupporterThisTurn) {
    setMessage(
      'Tu as déjà utilisé une carte Supporter pendant ce tour.'
    );

    return;
  }

  const hasFirePokemon =
    Object.values(board).some(
      (pokemon) =>
        pokemon !== null &&
        pokemon.owner === currentPlayer &&
        pokemon.card.type === 'feu'
    );

  if (!hasFirePokemon) {
    setMessage(
      'Tu n’as aucun Pokémon de type Feu en jeu.'
    );

    return;
  }

  setTrainerEffectActivated(true);

  setMessage(
    'Choisis l’un de tes Pokémon de type Feu pour lui ajouter 2 Énergies Feu.'
  );

  return;
}

if (
  selectedTrainerCard.effect ===
  'forceOpponentThenSelfSwitch'
) {
  if (hasUsedSupporterThisTurn) {
    setMessage(
      'Tu as déjà utilisé une carte Supporter pendant ce tour.'
    );

    return;
  }

  const opponent: Player =
    currentPlayer === 1 ? 2 : 1;

  const opponentCanSwitch =
    playerCanSwitchHorizontally(
      board,
      opponent
    );

  if (!opponentCanSwitch) {
    setMessage(
      `Le joueur ${opponent} n'a pas deux Pokémon pouvant être échangés sur une même ligne.`
    );

    return;
  }

  setPendingBothPlayersSwitch({
    card: selectedTrainerCard,

    playedBy: currentPlayer,

    // On manipule d'abord
    // les Pokémon adverses
    choosingPlayer: opponent,

    // MAIS c'est le joueur qui a joué
    // le Supporter qui les choisit
    controlledBy: currentPlayer,

    firstCell: null,
  });

  setTrainerEffectActivated(true);

  setMessage(
    `Joueur ${currentPlayer} : choisis le premier Pokémon du joueur ${opponent} que tu veux échanger.`
  );

  return;
}

  // --------------------------------
  // CARTE : ÉCHANGE DES DEUX JOUEURS
  // --------------------------------

  if (
    selectedTrainerCard.effect ===
    'bothPlayersSwitch'
  ) {
    const opponent: Player =
      currentPlayer === 1 ? 2 : 1;

    const opponentCanSwitch =
      playerCanSwitchHorizontally(
        board,
        opponent
      );

    const currentPlayerCanSwitch =
      playerCanSwitchHorizontally(
        board,
        currentPlayer
      );

    if (
      !opponentCanSwitch &&
      !currentPlayerCanSwitch
    ) {
      setMessage(
        "Aucun des deux joueurs ne possède deux Pokémon pouvant échanger."
      );
      return;
    }

    const firstPlayer: Player =
      opponentCanSwitch
        ? opponent
        : currentPlayer;

    setPendingBothPlayersSwitch({
      card: selectedTrainerCard,
      playedBy: currentPlayer,
      choosingPlayer: firstPlayer,
      // Corde Sortie :
  // le propriétaire choisit lui-même
  controlledBy: firstPlayer,
      firstCell: null,
    });

    

    setTrainerEffectActivated(true);

    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
    setSelectedAttachedTool(null);

    setMessage(
      opponentCanSwitch
        ? `Carte activée ! Le joueur ${opponent} échange en premier. Choisis son premier Pokémon.`
        : `Le joueur ${opponent} ne peut pas échanger. Joueur ${currentPlayer}, choisis ton premier Pokémon.`
    );

    return;
  }

  // --------------------------------
  // AUTRES CARTES DRESSEUR
  // --------------------------------

  setTrainerEffectActivated(true);

  if (
    selectedTrainerCard.effect ===
      'heal30' ||
    selectedTrainerCard.effect ===
      'heal20'
  ) {
    setMessage(
      `Choisis un de tes Pokémon à soigner.`
    );
    return;
  }

  if (
    selectedTrainerCard.effect ===
    'toolHp40'
  ) {
    setMessage(
      'Choisis un Pokémon de Niveau 1 auquel attacher cet Outil.'
    );
    return;
  }

  if (
    selectedTrainerCard.effect ===
    'returnPokemonToHand'
  ) {
    setMessage(
      'Choisis un de tes Pokémon à remettre dans ta main.'
    );
    return;
  }

  setMessage(
    `${selectedTrainerCard.name} est activée.`
  );
}

  function selectCard(
    card: PokemonCard,
    owner: Player
  ) {
    if (gameOver) return;

    if (owner !== currentPlayer) {
      setMessage(
        `C'est au joueur ${currentPlayer} de jouer.`
      );
      return;
    }

    if (hasPlacedThisTurn) {
      setMessage(
        'Tu as déjà posé un Pokémon pendant ce tour.'
      );
      return;
    }

    if (!canPlacePokemon(card, round)) {
  if (card.stage === 'niveau1') {
    setMessage(
      `${card.name} est un Pokémon Niveau 1. Il peut être posé à partir de la manche 2.`
    );
  } else if (card.stage === 'mega_ex') {
    setMessage(
      `${card.name} est un Méga Pokémon-ex. Il peut être posé à partir de la manche 2.`
    );
  } else if (card.stage === 'niveau2') {
    setMessage(
      `${card.name} est un Pokémon Niveau 2. Il peut être posé à partir de la manche 3.`
    );
  }

  return;
}

    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
    setSelectedCard(card);

    const row =
      currentPlayer === 1 ? 'B' : 'C';

    setMessage(
      `${card.name} sélectionné. Choisis une case ${row}1 à ${row}4.`
    );
  }

  function getOpponentPlacementDamage(
  placingPlayer: Player
): number {
  return Object.values(board).reduce(
    (total, pokemon) => {
      if (
        !pokemon ||
        pokemon.owner === placingPlayer
      ) {
        return total;
      }

      const talent =
        pokemon.card.talent;

      if (
        talent?.type === 'passive' &&
        talent.effect ===
          'damageOpponentOnPlay'
      ) {
        return total +
          (talent.amount ?? 30);
      }

      return total;
    },
    0
  );
}

function prepareKOEnergyMove(
  pokemon: PokemonInPlay,
  boardAfterKO: BoardState
): boolean {
  if (
    pokemon.attachedTool?.effect !==
    'moveEnergyOnKO'
  ) {
    return false;
  }

  if (
    pokemon.energies.length === 0
  ) {
    return false;
  }

  const hasAnotherPokemon =
    Object.values(
      boardAfterKO
    ).some(
      (otherPokemon) =>
        otherPokemon !== null &&
        otherPokemon.owner ===
          pokemon.owner
    );

  if (!hasAnotherPokemon) {
    return false;
  }

  setPendingKOEnergyMove({
    player: pokemon.owner,

    sourcePokemonName:
      pokemon.card.name,

    availableEnergies: [
      ...pokemon.energies,
    ],

    selectedEnergy: null,
  });

  return true;
}

function getPokemonLockKey(
  player: Player,
  cardId: string
): string {
  return `${player}-${cardId}`;
}

function activateInvocationSupporter() {
  if (
    !selectedTrainerCard ||
    selectedTrainerCard.effect !==
      'summonTwoBase60'
  ) {
    return;
  }

  // L'adversaire peut regarder,
  // jamais activer.
  if (
    selectedTrainerOwner !==
      currentPlayer
  ) {
    setMessage(
      'Tu peux consulter cette carte, mais seul son propriétaire peut l’activer.'
    );

    return;
  }

  if (hasAttackedThisTurn) {
    setMessage(
      "Tu ne peux plus jouer de carte Dresseur après avoir attaqué."
    );

    return;
  }

  if (
    hasUsedSupporterThisTurn
  ) {
    setMessage(
      'Tu as déjà utilisé une carte Supporter pendant ce tour.'
    );

    return;
  }

  const invocationCards =
    currentPlayer === 1
      ? player1InvocationCards
      : player2InvocationCards;

  if (
    invocationCards.length !== 2
  ) {
    setMessage(
      'Cette carte doit avoir exactement 2 Invocations associées.'
    );

    return;
  }

  const allowedRow =
    currentPlayer === 1
      ? 'B'
      : 'C';

  const emptyCells =
    boardCells.filter(
      (cell) =>
        cell.startsWith(
          allowedRow
        ) &&
        board[cell] === null
    );

  if (
    emptyCells.length < 2
  ) {
    setMessage(
      `Il faut 2 cases libres sur la ligne ${allowedRow} pour utiliser Invocation Duo.`
    );

    return;
  }

  const supporter =
    selectedTrainerCard;

  // --------------------------------
  // SUPPORTER -> DÉFAUSSE
  // --------------------------------

  if (currentPlayer === 1) {
    setPlayer1Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            supporter.id
        )
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        supporter,
      ]
    );
  } else {
    setPlayer2Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            supporter.id
        )
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        supporter,
      ]
    );
  }

  setHasUsedSupporterThisTurn(
    true
  );

  setPendingInvocationPlacement({
    player: currentPlayer,

    cards: [
      ...invocationCards,
    ],

    selectedIndex: null,

    supporter,
  });

  setSelectedTrainerCard(
    null
  );

  setSelectedTrainerOwner(
    null
  );

  setTrainerEffectActivated(
    false
  );

  setSelectedPokemonCell(
    null
  );

  setSelectedAttackIndex(
    null
  );

  setMessage(
    'Invocation Duo activée ! Choisis la première Invocation à poser.'
  );
}

  function handleCellPress(cellName: string) {
    if (gameOver) return;

// ========================================
// POSE DES INVOCATIONS
// ========================================

if (
  pendingInvocationPlacement
) {
  const {
    player,
    cards,
    selectedIndex,
  } =
    pendingInvocationPlacement;

  if (
    player !== currentPlayer
  ) {
    return;
  }

  if (
    selectedIndex === null
  ) {
    setMessage(
      'Choisis d’abord une des Invocations.'
    );

    return;
  }

  const allowedRow =
    player === 1
      ? 'B'
      : 'C';

  if (
    !cellName.startsWith(
      allowedRow
    )
  ) {
    setMessage(
      `Les Invocations du joueur ${player} doivent être posées sur ${allowedRow}1 à ${allowedRow}4.`
    );

    return;
  }

  if (
    board[cellName] !== null
  ) {
    setMessage(
      `${cellName} est déjà occupée.`
    );

    return;
  }

  const card =
    cards[selectedIndex];

  const invocation:
    PokemonInPlay = {

    card,

    owner: player,

    currentHp:
      card.maxHp,

    // IMPORTANT :
    // aucune Énergie à l'invocation.
    energies: [],

    isInvocation: true,

    attachedTool: null,

    hasAttacked: false,

    hasRetreated: false,

    attackDamageReduction: 0,

    attackDamageReductionEndPlayer:
      null,

    poisoned: false,

    poisonSourcePlayer:
      null,

    burned: false,

    burnSourcePlayer:
      null,

    burnTriggersRemaining: 0,

    paralyzed: false,

    paralysisTurnsRemaining: 0,

    confused: false,

    confusionTurnsRemaining: 0,

    asleep: false,

    sleepSourcePlayer:
      null,

    sleepEndPlayer:
      null,

    coinHistory: {},
  };

  const placementDamage =
  getOpponentPlacementDamage(
    player
  );

const invocationAfterPlacementDamage:
  PokemonInPlay = {
  ...invocation,

  currentHp:
    invocation.currentHp -
    placementDamage,
};

const knockedOutOnPlacement =
  invocationAfterPlacementDamage
    .currentHp <= 0;

if (
  knockedOutOnPlacement
) {
  // L'Invocation arrive,
  // subit le Talent de Noctunoir,
  // puis est K.O.
  setBoard(
    (previousBoard) => ({
      ...previousBoard,

      [cellName]: null,
    })
  );

  const penalty =
    getKOPenalty(
      card.stage,
      card.variant
    );

  if (player === 1) {
    setPlayer1Damage(
      (damage) =>
        damage + penalty
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        card,
      ]
    );
  } else {
    setPlayer2Damage(
      (damage) =>
        damage + penalty
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        card,
      ]
    );
  }
} else {
  // L'Invocation survit
  // et reste sur le plateau
  // avec les dégâts reçus.
  setBoard(
    (previousBoard) => ({
      ...previousBoard,

      [cellName]:
        invocationAfterPlacementDamage,
    })
  );
}

  // On retire seulement
  // l'Invocation qui vient
  // d'être posée.
  //
  // Important car les deux
  // cartes peuvent avoir le
  // même id.
  const remainingCards =
    cards.filter(
      (_, index) =>
        index !==
        selectedIndex
    );

  if (
    remainingCards.length === 0
  ) {
    setPendingInvocationPlacement(
      null
    );

    if (
  knockedOutOnPlacement
) {
  setMessage(
    `${card.name} est invoqué en ${cellName}, subit ${placementDamage} dégâts à cause d'Invitation Obscure et est K.O. !`
  );
} else if (
  placementDamage > 0
) {
  setMessage(
    `${card.name} est invoqué en ${cellName} avec 0 Énergie et subit ${placementDamage} dégâts à cause d'Invitation Obscure.`
  );
} else {
  setMessage(
    `${card.name} est invoqué en ${cellName} avec 0 Énergie.`
  );
}
    return;
  }

  setPendingInvocationPlacement({
    ...pendingInvocationPlacement,

    cards:
      remainingCards,

    selectedIndex:
      null,
  });

  if (
  knockedOutOnPlacement
) {
  setMessage(
    `${card.name} est invoqué en ${cellName}, subit ${placementDamage} dégâts à cause d'Invitation Obscure et est K.O. ! Choisis maintenant la deuxième Invocation.`
  );
} else if (
  placementDamage > 0
) {
  setMessage(
    `${card.name} est invoqué en ${cellName} avec 0 Énergie et subit ${placementDamage} dégâts à cause d'Invitation Obscure. Choisis maintenant la deuxième Invocation.`
  );
} else {
  setMessage(
    `${card.name} est invoqué en ${cellName} avec 0 Énergie. Choisis maintenant la deuxième Invocation.`
  );
}

  return;
}

// =====================================
// CHOIX DU POKÉMON DE BANC
// POUR L'ÉNERGIE
// =====================================

if (pendingGeneratedBenchEnergy) {
  const pokemon =
    board[cellName];

  if (!pokemon) {
    setMessage(
      'Choisis un Pokémon de banc.'
    );

    return;
  }

  if (
    pokemon.owner !==
    pendingGeneratedBenchEnergy.player
  ) {
    setMessage(
      'Tu dois choisir l’un de tes propres Pokémon.'
    );

    return;
  }

  if (
    cellName ===
    pendingGeneratedBenchEnergy
      .attackerCell
  ) {
    setMessage(
      `${pokemon.card.name} est le Pokémon actif et ne peut pas recevoir cette Énergie.`
    );

    return;
  }

  const energyType =
    pendingGeneratedBenchEnergy
      .energyType;

  const amount =
    pendingGeneratedBenchEnergy
      .amount;

  setBoard(
    (previousBoard) => {
      const currentPokemon =
        previousBoard[cellName];

      if (!currentPokemon) {
        return previousBoard;
      }

      return {
        ...previousBoard,

        [cellName]: {
          ...currentPokemon,

          energies: [
            ...currentPokemon
              .energies,

            ...Array(amount).fill(
              energyType
            ),
          ],
        },
      };
    }
  );

  setMessage(
    `${pokemon.card.name} reçoit ${amount} Énergie ${energyType}.`
  );

  setPendingGeneratedBenchEnergy(
    null
  );

  return;
}

// =====================================
// SCARHINO : L'ADVERSAIRE ÉCHANGE
// SON POKÉMON ACTIF
// =====================================

if (pendingOpponentActiveSwitch) {
  const benchPokemon =
    board[cellName];

  if (!benchPokemon) {
    setMessage(
      'Choisis un Pokémon de banc.'
    );

    return;
  }

  if (
    benchPokemon.owner !==
    pendingOpponentActiveSwitch.player
  ) {
    setMessage(
      `Le joueur ${pendingOpponentActiveSwitch.player} doit choisir l’un de ses propres Pokémon.`
    );

    return;
  }

  if (
    cellName ===
    pendingOpponentActiveSwitch
      .activeCell
  ) {
    setMessage(
      'Tu dois choisir un autre Pokémon.'
    );

    return;
  }

  const activeCell =
    pendingOpponentActiveSwitch
      .activeCell;

  const activePokemon =
    board[activeCell];

  if (!activePokemon) {
    setPendingOpponentActiveSwitch(
      null
    );

    return;
  }

  setBoard(
    (previousBoard) => ({
      ...previousBoard,

      [activeCell]:
  previousBoard[cellName]
    ? {
        ...previousBoard[
          cellName
        ]!,

        lastSwitchedTurnId:
          turnId,
      }
    : null,

[cellName]:
  previousBoard[activeCell]
    ? {
        ...previousBoard[
          activeCell
        ]!,

        lastSwitchedTurnId:
          turnId,
      }
    : null,
    })
  );

  setMessage(
    `Le joueur ${pendingOpponentActiveSwitch.player} échange ${activePokemon.card.name} avec ${benchPokemon.card.name}.`
  );

  setPendingOpponentActiveSwitch(
    null
  );

  return;
}

// =====================================
// RAPPEL CHANCEUX : CHOIX DU POKÉMON
// =====================================

if (pendingCoinReturnToHand) {
  const target =
    board[cellName];

  if (!target) {
    setMessage(
      'Choisis un de tes Pokémon.'
    );

    return;
  }

  if (
  target.isInvocation
) {
  setMessage(
    `${target.card.name} est une Invocation et ne peut pas être ciblé par Super Rappel.`
  );

  return;
}

  if (
    target.owner !==
    pendingCoinReturnToHand.player
  ) {
    setMessage(
      'Tu dois choisir un de tes propres Pokémon.'
    );

    return;
  }

  // Même blocage de repose que Margie
  if (
    target.card.stage ===
    'niveau1'
  ) {
    setPokemonPlacementLocks(
      (previous) => ({
        ...previous,

        [target.card.id]:
          round,
      })
    );
  }

  if (
    target.card.stage ===
    'niveau2'
  ) {
    setPokemonPlacementLocks(
      (previous) => ({
        ...previous,

        [target.card.id]:
          round + 1,
      })
    );
  }

  // Pokémon + Outil -> main
  if (target.owner === 1) {
    setPlayer1Hand(
      (hand) => [
        ...hand,

        target.card,

        ...(target.attachedTool
          ? [target.attachedTool]
          : []),
      ]
    );
  } else {
    setPlayer2Hand(
      (hand) => [
        ...hand,

        target.card,

        ...(target.attachedTool
          ? [target.attachedTool]
          : []),
      ]
    );
  }

  // IMPORTANT :
  // on ne met PAS les Énergies
  // dans la défausse.
  // Elles disparaissent simplement.

  setBoard(
    (previousBoard) => ({
      ...previousBoard,

      [cellName]: null,
    })
  );

  setMessage(
    `${target.card.name} retourne dans la main.` +
      (
        target.attachedTool
          ? ` ${target.attachedTool.name} retourne également dans la main.`
          : ''
      ) +
      (
        target.energies.length > 0
          ? ` Ses ${target.energies.length} Énergie(s) disparaissent.`
          : ''
      )
  );

  setPendingCoinReturnToHand(
    null
  );

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return;
}

// =====================================
// OUTIL : DÉPLACER UNE ÉNERGIE APRÈS K.O.
// =====================================

if (pendingKOEnergyMove) {
  const target =
    board[cellName];

  if (
    !pendingKOEnergyMove
      .selectedEnergy
  ) {
    setMessage(
      'Choisis d’abord l’Énergie que tu veux déplacer.'
    );

    return;
  }

  if (!target) {
    setMessage(
      'Choisis l’un de tes Pokémon en jeu.'
    );

    return;
  }

  if (
    target.owner !==
    pendingKOEnergyMove.player
  ) {
    setMessage(
      'Tu dois choisir l’un de tes propres Pokémon.'
    );

    return;
  }

  const energyToMove =
    pendingKOEnergyMove
      .selectedEnergy;

  // Ajoute l'Énergie au Pokémon choisi
  setBoard(
    (previousBoard) => {

      const currentTarget =
        previousBoard[cellName];

      if (!currentTarget) {
        return previousBoard;
      }

      return {
        ...previousBoard,

        [cellName]: {
          ...currentTarget,

          energies: [
            ...currentTarget
              .energies,

            energyToMove,
          ],
        },
      };
    }
  );

  // Retire UNE occurrence
  // de cette Énergie de la défausse
  const removeEnergyFromDiscard = (
    discard: EnergyType[]
  ) => {
    const index =
      discard.findIndex(
        (energy) =>
          energy ===
          energyToMove
      );

    if (index === -1) {
      return discard;
    }

    const newDiscard = [
      ...discard,
    ];

    newDiscard.splice(
      index,
      1
    );

    return newDiscard;
  };

  if (
    pendingKOEnergyMove.player ===
    1
  ) {
    setPlayer1DiscardEnergies(
      removeEnergyFromDiscard
    );
  } else {
    setPlayer2DiscardEnergies(
      removeEnergyFromDiscard
    );
  }

  setMessage(
    `${energyToMove} de ${pendingKOEnergyMove.sourcePokemonName} est déplacée vers ${target.card.name}.`
  );

  setPendingKOEnergyMove(null);

  return;
}

// ========================================
// ÉCHANGE DES DEUX JOUEURS
// ========================================

if (pendingBothPlayersSwitch) {
  const {
  card,
  playedBy,
  choosingPlayer,
  controlledBy,
  firstCell,
} = pendingBothPlayersSwitch;

  const clickedPokemon =
    board[cellName];

    if (
  clickedPokemon?.isInvocation
) {
  setMessage(
    `${clickedPokemon.card.name} est une Invocation et ne peut pas être ciblé par cette carte Dresseur.`
  );

  return;
}


  // Le joueur qui doit choisir
  // doit cliquer sur un de ses Pokémon
  if (
    !clickedPokemon ||
    clickedPokemon.owner !==
      choosingPlayer
  ) {
    setMessage(
  `Joueur ${controlledBy} : tu dois choisir un Pokémon appartenant au joueur ${choosingPlayer}.`
);

    return;
  }

  // =================================
  // PREMIER POKÉMON
  // =================================

  if (firstCell === null) {
    if (
      !hasHorizontalPartner(
        board,
        choosingPlayer,
        cellName
      )
    ) {
      setMessage(
        `${clickedPokemon.card.name} n'a aucun Pokémon de la même ligne avec lequel échanger.`
      );

      return;
    }

    setPendingBothPlayersSwitch({
      ...pendingBothPlayersSwitch,
      firstCell: cellName,
    });

    setMessage(
  `Joueur ${controlledBy} : choisis maintenant un autre Pokémon du joueur ${choosingPlayer} sur la ligne ${cellName[0]}.`
);

    return;
  }

  // =================================
  // DEUXIÈME POKÉMON
  // =================================

  if (cellName === firstCell) {
    setMessage(
      'Choisis un autre Pokémon.'
    );

    return;
  }

  if (
    cellName[0] !== firstCell[0]
  ) {
    setMessage(
      'Les deux Pokémon doivent être sur la même ligne.'
    );

    return;
  }

  const firstPokemon =
  board[firstCell];

if (
  !firstPokemon ||
  firstPokemon.owner !==
    choosingPlayer ||
  firstPokemon.isInvocation
) {
  setPendingBothPlayersSwitch(
    null
  );

  setTrainerEffectActivated(
    false
  );

  return;
}
    

  // =================================
  // EFFECTUER L'ÉCHANGE
  // =================================

  const newBoard: BoardState = {
    ...board,
  };

  newBoard[firstCell] = {
  ...clickedPokemon,

  lastSwitchedTurnId:
    turnId,
};

newBoard[cellName] = {
  ...firstPokemon,

  lastSwitchedTurnId:
    turnId,
};

  setBoard(newBoard);

  // =================================
  // L'ADVERSAIRE VIENT D'ÉCHANGER
  // =================================

  if (
    choosingPlayer !== playedBy
  ) {
    const playerCanSwitch =
      playerCanSwitchHorizontally(
        newBoard,
        playedBy
      );

    // Le joueur qui a joué la carte
    // peut lui aussi échanger
    if (playerCanSwitch) {
      setPendingBothPlayersSwitch({
  card,

  playedBy,

  // Maintenant on échange
  // les Pokémon du joueur
  // ayant joué la carte.
  choosingPlayer: playedBy,

  // Et c'est évidemment toujours
  // lui qui choisit.
  controlledBy: playedBy,

  firstCell: null,
});

      setMessage(
        `Échange du joueur ${choosingPlayer} terminé. Joueur ${playedBy}, choisis maintenant ton premier Pokémon.`
      );

      return;
    }

    // Le joueur actif ne peut pas
    // échanger : l'effet se termine
  }

  // =================================
  // FIN DE L'EFFET
  // =================================

  if (playedBy === 1) {
    setPlayer1Hand((hand) =>
      hand.filter(
        (handCard) =>
          handCard.id !== card.id
      )
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        card,
      ]
    );
  } else {
    setPlayer2Hand((hand) =>
      hand.filter(
        (handCard) =>
          handCard.id !== card.id
      )
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        card,
      ]
    );
  }

  if (
  card.category === 'supporter'
) {
  setHasUsedSupporterThisTurn(true);
}

  setPendingBothPlayersSwitch(null);

  setSelectedTrainerCard(null);

  setTrainerEffectActivated(
    false
  );

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);
  setSelectedAttachedTool(null);

  setMessage(
  card.category === 'supporter'
    ? 'Les échanges sont terminés. Le Supporter va dans la défausse.'
    : 'Les échanges sont terminés. La carte Objet va dans la défausse.'
);

  return;
}

   if (selectedAttachedTool) {
  const clickedPokemon =
    board[cellName];

    if (
  clickedPokemon?.isInvocation
) {
  setMessage(
    `${clickedPokemon.card.name} est une Invocation et ne peut pas être ciblé par une carte Dresseur.`
  );

  return;
}

  if (
    clickedPokemon &&
    clickedPokemon.owner ===
      currentPlayer
  ) {
    setSelectedAttachedTool(null);
  }
}

    if (pendingOpponentTarget) {
  const target =
    board[cellName];

  // Case vide
  if (!target) {
    setMessage(
      'Choisis un Pokémon adverse.'
    );
    return;
  }

  // Pokémon du mauvais joueur
  if (
    target.owner ===
    pendingOpponentTarget.player
  ) {
    setMessage(
      'Tu dois choisir un Pokémon adverse.'
    );
    return;
  }

  if (
  pendingOpponentTarget.mode ===
    'damagedOpponentOrPlayer' &&
  target.currentHp >=
    getPokemonMaxHp(target)
) {
  setMessage(
    `${target.card.name} n'a aucun marqueur de dégâts.`
  );

  return;
}

if (
  pendingOpponentTarget.mode ===
    'benchOrPlayer' &&
  pendingOpponentTarget.excludedCell ===
    cellName
) {
  setMessage(
    `${target.card.name} est le Pokémon qui a reçu l'attaque principale et n'est donc pas une cible de banc.`
  );

  return;
}

  const pendingAttacker =
  board[
    pendingOpponentTarget.attackerCell
  ];

if (
  pendingAttacker &&
  doesTalentPreventAllAttackEffects(
    target,
    pendingAttacker
  )
) {
  setMessage(
    `${target.card.name} évite tous les effets de l'attaque grâce à son Talent ${target.card.talent?.name}.`
  );

  setPendingOpponentTarget(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return;
}

const activeDamageReduction =
  pendingAttacker &&
  target.attackDamageReductionEndPlayer ===
    pendingAttacker.owner
    ? target.attackDamageReduction ?? 0
    : 0;

const damageToTarget =
  Math.max(
    0,
    pendingOpponentTarget.damage -
      activeDamageReduction
  );

const pendingExtraDamage =
  target.extraDamageNextTurnReady &&
  target
    .extraDamageNextTurnSourcePlayer ===
    pendingOpponentTarget.player
    ? target.extraDamageNextTurn ?? 0
    : 0;

const pendingDamage =
  pendingOpponentTarget.damage +
  pendingExtraDamage;


const remainingHp =
  target.currentHp -
  pendingDamage;

  // -----------------------------
  // K.O.
  // -----------------------------

  if (remainingHp <= 0) {
  const updatedBoard: BoardState = {
    ...board,
  };

  // =================================
  // TALENT DE SCARHINO
  // =================================

  if (
    startKOSurvivalTalent(
      {
        ...target,
        currentHp: remainingHp,
      },

      cellName,

      updatedBoard
    )
  ) {
    setPendingOpponentTarget(null);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    return;
  }

  // =================================
  // K.O. NORMAL
  // =================================

  const penalty =
    getKOPenalty(
      target.card.stage,
      target.card.variant
    );

    updatedBoard[cellName] = null;

    prepareKOEnergyMove(
  target,
  updatedBoard
);

    if (target.owner === 1) {
      setPlayer1Damage(
        (damage) =>
          damage + penalty
      );

      setPlayer1DiscardEnergies(
        (discard) => [
          ...discard,
          ...target.energies,
        ]
      );

      setPlayer1Discard(
        (discard) => [
          ...discard,
          target.card,
        ]
      );
    } else {
      setPlayer2Damage(
        (damage) =>
          damage + penalty
      );

      setPlayer2DiscardEnergies(
        (discard) => [
          ...discard,
          ...target.energies,
        ]
      );

      setPlayer2Discard(
        (discard) => [
          ...discard,
          target.card,
        ]
      );
    }

    setBoard(updatedBoard);

    setMessage(
      `${target.card.name} subit ${pendingDamage} dégâts et est K.O. ! Le joueur ${target.owner} reçoit +${penalty} dégâts.`
    );

    

    setPendingOpponentTarget(null);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    return;
  }

  // -----------------------------
  // LE POKÉMON SURVIT
  // -----------------------------

  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]: {
      ...target,
      currentHp: remainingHp,
    },
  }));

  setMessage(
    `${target.card.name} subit ${pendingDamage} dégâts.`
  );


  setPendingOpponentTarget(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return;
}

    if (pendingPokemonSwitch) {
  const targetPokemon =
    board[cellName];

  const attacker =
    board[
      pendingPokemonSwitch.attackerCell
    ];

  if (!attacker) {
    setPendingPokemonSwitch(null);
    return;
  }

  if (!targetPokemon) {
    setMessage(
      'Choisis un de tes Pokémon de banc.'
    );
    return;
  }

  if (
    targetPokemon.owner !==
    pendingPokemonSwitch.player
  ) {
    setMessage(
      'Tu dois choisir un de tes Pokémon.'
    );
    return;
  }

  if (
    cellName ===
    pendingPokemonSwitch.attackerCell
  ) {
    setMessage(
      'Choisis un autre Pokémon.'
    );
    return;
  }

  const attackerRow =
    pendingPokemonSwitch
      .attackerCell[0];

  const targetRow =
    cellName[0];

  if (attackerRow !== targetRow) {
    setMessage(
      'Les Pokémon peuvent seulement échanger horizontalement sur la même ligne.'
    );
    return;
  }

  const attackerCell =
    pendingPokemonSwitch.attackerCell;

  setBoard((previousBoard) => {
    const newBoard = {
      ...previousBoard,
    };

    const currentAttacker =
      previousBoard[attackerCell];

    const currentTarget =
      previousBoard[cellName];

    if (
      !currentAttacker ||
      !currentTarget
    ) {
      return previousBoard;
    }

    newBoard[attackerCell] = {
  ...currentTarget,

  lastSwitchedTurnId:
    turnId,
};

newBoard[cellName] = {
  ...currentAttacker,

  lastSwitchedTurnId:
    turnId,
};

    return newBoard;
  });

  setMessage(
    `${attacker.card.name} échange sa place avec ${targetPokemon.card.name}.`
  );

  setPendingPokemonSwitch(null);
  setSelectedPokemonCell(null);

  return;
}

if (pendingBenchEnergyAttachment) {
  const pokemon =
    board[cellName];

  if (!pokemon) {
    setMessage(
      'Choisis un Pokémon de banc.'
    );
    return;
  }

  if (
    pokemon.owner !==
    pendingBenchEnergyAttachment.player
  ) {
    setMessage(
      'Tu dois choisir l’un de tes Pokémon.'
    );
    return;
  }

  if (
    cellName ===
    pendingBenchEnergyAttachment.attackerCell
  ) {
    setMessage(
      `${pokemon.card.name} est le Pokémon actif et ne peut pas recevoir cette Énergie.`
    );
    return;
  }

    


  const energyType =
    pendingBenchEnergyAttachment.energyType;

  const discardEnergies =
    pendingBenchEnergyAttachment.player === 1
      ? player1DiscardEnergies
      : player2DiscardEnergies;

  const energyIndex =
    discardEnergies.findIndex(
      (energy) =>
        energy === energyType
    );

  if (energyIndex === -1) {
    setMessage(
      `Il n'y a plus d'Énergie ${energyType} dans la défausse.`
    );

    setPendingBenchEnergyAttachment(
      null
    );

    return;
  }

  const newDiscard = [
    ...discardEnergies,
  ];

  const recoveredEnergy =
    newDiscard[energyIndex];

  newDiscard.splice(
    energyIndex,
    1
  );

  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]: {
      ...pokemon,

      energies: [
        ...pokemon.energies,
        recoveredEnergy,
      ],
    },
  }));

  if (
    pendingBenchEnergyAttachment.player === 1
  ) {
    setPlayer1DiscardEnergies(
      newDiscard
    );
  } else {
    setPlayer2DiscardEnergies(
      newDiscard
    );
  }

  setMessage(
    `🔥 Une Énergie Feu a été attachée à ${pokemon.card.name}.`
  );

  setPendingBenchEnergyAttachment(
    null
  );

  return;
}

    // UTILISATION D'UNE CARTE DRESSEUR
if (selectedTrainerCard) {
  const target = board[cellName];

if (
  target?.isInvocation
) {
  setMessage(
    `${target.card.name} est une Invocation et ne peut pas être ciblé par une carte Dresseur.`
  );

  return;
}

if (!trainerEffectActivated) {
  setMessage(
    `Appuie d'abord sur ACTIVER pour utiliser ${selectedTrainerCard.name}.`
  );
  return;
}

  if (hasAttackedThisTurn) {
  setMessage(
    "Tu ne peux plus jouer de carte Dresseur après avoir attaqué."
  );
  return;
}

// =====================================
// SUPPORTER : +2 ÉNERGIES FEU
// PUIS FIN DU TOUR
// =====================================

if (
  selectedTrainerCard.effect ===
  'attach2FireEndTurn'
) {
  if (!target) {
    
    setMessage(
      'Choisis un de tes Pokémon de type Feu.'
    );

    return;
  }

  if (
    target.owner !== currentPlayer
  ) {
    setMessage(
      'Tu dois choisir un de tes propres Pokémon.'
    );

    return;
  }

  if (
    target.card.type !== 'feu'
  ) {
    setMessage(
      `${target.card.name} n'est pas un Pokémon de type Feu.`
    );

    return;
  }

  const updatedBoard: BoardState = {
    ...board,

    [cellName]: {
      ...target,

      energies: [
        ...target.energies,
        'feu',
        'feu',
      ],
    },
  };

  // Supporter -> défausse
  if (currentPlayer === 1) {
    setPlayer1Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            selectedTrainerCard.id
        )
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  } else {
    setPlayer2Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            selectedTrainerCard.id
        )
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  }

  // On termine immédiatement
  // le tour AVEC le nouveau plateau.
  endTurn(updatedBoard);

  return;
}

  if (!target) {
    setMessage('Choisis un Pokémon présent sur le plateau.');
    return;
  }

  if (
  selectedTrainerCard.effect !==
    'bothPlayersSwitch' &&
  target.owner !== currentPlayer
) {
  setMessage(
    'Tu dois choisir un de tes propres Pokémon.'
  );
  return;
}

// ------------------------------------
// SOIN : OBJET +30 / SUPPORTER +20
// ------------------------------------

if (
  selectedTrainerCard.effect === 'heal30' ||
  selectedTrainerCard.effect === 'heal20'
) {
  // Si c'est un Supporter, un seul
  // Supporter peut être utilisé par tour
  if (
    selectedTrainerCard.category ===
      'supporter' &&
    hasUsedSupporterThisTurn
  ) {
    setMessage(
      'Tu as déjà utilisé une carte Supporter pendant ce tour.'
    );
    return;
  }

  const targetMaxHp =
    getPokemonMaxHp(target);

  // Pokémon déjà au maximum :
  // la carte reste dans la main
  if (
    target.currentHp >= targetMaxHp
  ) {
    setMessage(
      `${target.card.name} a déjà tous ses PV.`
    );
    return;
  }

  const healAmount =
    selectedTrainerCard.effect ===
    'heal30'
      ? 30
      : 20;

  const healedHp = Math.min(
    target.currentHp + healAmount,
    targetMaxHp
  );

  const actualHeal =
    healedHp - target.currentHp;

  // Applique le soin
  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]: {
      ...target,
      currentHp: healedHp,
    },
  }));

  // --------------------------------
  // CARTE -> DÉFAUSSE
  // --------------------------------

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) =>
      hand.filter(
        (card) =>
          card.id !==
          selectedTrainerCard.id
      )
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  } else {
    setPlayer2Hand((hand) =>
      hand.filter(
        (card) =>
          card.id !==
          selectedTrainerCard.id
      )
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  }

  // Si c'était un Supporter,
  // on compte le Supporter comme utilisé
  if (
    selectedTrainerCard.category ===
    'supporter'
  ) {
    setHasUsedSupporterThisTurn(
      true
    );
  }

  setMessage(
    `${target.card.name} récupère ${actualHeal} PV (${healedHp}/${targetMaxHp} PV).`
  );

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return;
}

// ------------------------------------
// SUPPORTER : RAMENER UN POKÉMON
// DANS LA MAIN
// ------------------------------------

if (
  selectedTrainerCard?.effect ===
  'returnPokemonToHand'
) {
  const target = board[cellName];

  if (!target) {
    setMessage(
      'Choisis un de tes Pokémon sur le plateau.'
    );
    return;
  }

  if (
    target.owner !== currentPlayer
  ) {
    setMessage(
      'Tu dois choisir un de tes Pokémon.'
    );
    return;
  }

  const targetMaxHp =
  getPokemonMaxHp(target);

if (
  target.currentHp >= targetMaxHp
) {
  setMessage(
    `${target.card.name} n'a subi aucun dégât. Margie ne peut être utilisée que sur un Pokémon blessé.`
  );

  return;
}

  // Supporter déjà utilisé ce tour
  if (hasUsedSupporterThisTurn) {
    setMessage(
      'Tu as déjà utilisé une carte Supporter pendant ce tour.'
    );
    return;
  }

  // -----------------------------
  // BLOCAGE DE REPOSE
  // -----------------------------

const placementLockKey =
  getPokemonLockKey(
    target.owner,
    target.card.id
  );

  if (
    target.card.stage === 'niveau1'
  ) {
    setPokemonPlacementLocks(
      (previous) => ({
        ...previous,

        // Bloqué jusqu'à la fin
        // de la manche actuelle
        [placementLockKey]: round,
      })
    );
  }

  if (
    target.card.stage === 'niveau2'
  ) {
    setPokemonPlacementLocks(
      (previous) => ({
        ...previous,

        // Manche actuelle +
        // prochain tour du joueur
        [placementLockKey]:
  round + 1,
      })
    );
  }

  // -----------------------------
  // REMET LE POKÉMON EN MAIN
  // -----------------------------

  if (target.owner === 1) {
    setPlayer1Hand((hand) => [
      ...hand,
      target.card,

      ...(target.attachedTool
        ? [target.attachedTool]
        : []),
    ]);

    
  } else {
    setPlayer2Hand((hand) => [
      ...hand,
      target.card,

      ...(target.attachedTool
        ? [target.attachedTool]
        : []),
    ]);

    
  }

  // Libère la case
  setBoard((previousBoard) => ({
    ...previousBoard,
    [cellName]: null,
  }));

  // Le Supporter va dans
  // la défausse
  if (currentPlayer === 1) {
    setPlayer1Hand((hand) =>
      hand.filter(
        (card) =>
          card.id !==
          selectedTrainerCard.id
      )
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  } else {
    setPlayer2Hand((hand) =>
      hand.filter(
        (card) =>
          card.id !==
          selectedTrainerCard.id
      )
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        selectedTrainerCard,
      ]
    );
  }

  setHasUsedSupporterThisTurn(true);

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedAttachedTool(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `${target.card.name} retourne dans la main du joueur ${target.owner}.` +
      (target.attachedTool
        ? ` ${target.attachedTool.name} retourne également dans la main.`
        : '') +
      (target.card.stage ===
      'niveau1'
        ? ` ${target.card.name} ne peut pas être reposé pendant ce tour.`
        : target.card.stage ===
          'niveau2'
        ? ` ${target.card.name} ne peut être reposé ni pendant ce tour ni pendant le prochain tour de ce joueur.`
        : '')
  );

  return;
}

if (
  selectedTrainerCard.effect ===
  'moveEnergyOnKO'
) {
  const pokemon =
    board[cellName];

  if (!pokemon) {
    setMessage(
      'Choisis un de tes Pokémon.'
    );

    return;
  }

  if (
    pokemon.owner !==
    currentPlayer
  ) {
    setMessage(
      'Tu dois choisir un de tes Pokémon.'
    );

    return;
  }

  if (pokemon.attachedTool) {
    setMessage(
      `${pokemon.card.name} possède déjà un Outil.`
    );

    return;
  }

  setBoard(
    (previousBoard) => ({
      ...previousBoard,

      [cellName]: {
        ...pokemon,

        attachedTool:
          selectedTrainerCard,
      },
    })
  );

  if (currentPlayer === 1) {
    setPlayer1Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            selectedTrainerCard.id
        )
    );
  } else {
    setPlayer2Hand(
      (hand) =>
        hand.filter(
          (card) =>
            card.id !==
            selectedTrainerCard.id
        )
    );
  }

  setMessage(
    `${selectedTrainerCard.name} est attaché à ${pokemon.card.name}.`
  );

  setSelectedTrainerCard(null);

  setTrainerEffectActivated(
    false
  );

  return;
}

  if (
  selectedTrainerCard.effect ===
  'toolHp40'
) {
  const pokemon = board[cellName];

  if (!pokemon) {
    setMessage(
      'Choisis un Pokémon de Niveau 1.'
    );
    return;
  }

  if (
    pokemon.owner !== currentPlayer
  ) {
    setMessage(
      'Tu dois choisir un de tes Pokémon.'
    );
    return;
  }

  if (
    pokemon.card.stage !==
    'niveau1'
  ) {
    setMessage(
      'Cet Outil peut seulement être attaché à un Pokémon de Niveau 1.'
    );
    return;
  }

  if (pokemon.attachedTool) {
    setMessage(
      `${pokemon.card.name} possède déjà un Outil.`
    );
    return;
  }

  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]: {
      ...pokemon,

      attachedTool:
        selectedTrainerCard,

      currentHp:
        pokemon.currentHp + 40,
    },
  }));

  setMessage(
    `${selectedTrainerCard.name} est attachée à ${pokemon.card.name}. Ses PV maximum augmentent de 40.`
  );

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) =>
      hand.filter(
        (card) =>
          card.id !==
          selectedTrainerCard.id
      )
    );
  } else {
    setPlayer2Hand((hand) =>
      hand.filter(
        (card) =>
          card.id !==
          selectedTrainerCard.id
      )
    );
  }
  // Ensuite il faudra retirer la carte
  // de la main du joueur.
  
  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);

  return;
}

}
    const pokemon = board[cellName];
// --------------------------------
// POKÉMON EN MAIN SÉLECTIONNÉ
// + CLIC SUR UN POKÉMON DU PLATEAU
// --------------------------------

if (
  selectedCard &&
  pokemon
) {
  // On désélectionne le Pokémon
  // de la main
  setSelectedCard(null);

  // On garde la règle actuelle :
  // on ne peut sélectionner pour agir
  // que sur son propre Pokémon
  if (
    pokemon.owner !== currentPlayer
  ) {
    setMessage(
      `Ce Pokémon appartient au joueur ${pokemon.owner}.`
    );

    return;
  }

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedAttachedTool(null);

  // On affiche le Pokémon du plateau
  setSelectedPokemonCell(cellName);
  setSelectedAttackIndex(null);

  setMessage(
    `${pokemon.card.name} sélectionné en ${cellName}.`
  );

  return;
}
    // POSE D'UNE CARTE
    if (selectedCard) {

      const placementLockKey =
  getPokemonLockKey(
    currentPlayer,
    selectedCard.id
  );

const lockedUntilRound =
  pokemonPlacementLocks[
    placementLockKey
  ];

if (
  lockedUntilRound !== undefined &&
  round <= lockedUntilRound
) {
  setMessage(
    `${selectedCard.name} ne peut pas encore être rejoué.`
  );

  return;
}
      if (hasPlacedThisTurn) {
        setMessage(
          'Tu as déjà posé un Pokémon pendant ce tour.'
        );
        return;
      }

      const allowedRow =
        currentPlayer === 1 ? 'B' : 'C';

      if (!cellName.startsWith(allowedRow)) {
        setMessage(
          `Le joueur ${currentPlayer} peut poser uniquement sur ${allowedRow}1 à ${allowedRow}4.`
        );
        return;
      }

      if (pokemon !== null) {
        setMessage(`${cellName} est déjà occupée.`);
        return;
      }

      const passiveEnergyLimit =
  getPassiveEnergyLimit(
    selectedCard
  );

const startingEnergyCount =
  Math.min(
    2,
    passiveEnergyLimit
  );

const startingEnergies:
  EnergyType[] =
  Array(startingEnergyCount).fill(
    selectedCard.type
  );

      const pokemonToPlace: PokemonInPlay = {
        card: selectedCard,
        owner: currentPlayer,
        currentHp: selectedCard.maxHp,
        energies: startingEnergies,
        attachedTool: null,
        hasAttacked: false,
        hasRetreated: false,

        attackDamageReduction: 0,
attackDamageReductionEndPlayer: null,

        poisoned: false,
poisonSourcePlayer: null,

burned: false,
burnSourcePlayer: null,
burnTriggersRemaining: 0,

paralyzed: false,
paralysisTurnsRemaining: 0,

confused: false,
confusionTurnsRemaining: 0,

asleep: false,
sleepSourcePlayer: null,
sleepEndPlayer: null,



coinHistory: {},
      };

      const placementDamage =
  getOpponentPlacementDamage(
    currentPlayer
  );

const pokemonAfterPlacementDamage:
  PokemonInPlay = {
    ...pokemonToPlace,

    currentHp:
      pokemonToPlace.currentHp -
      placementDamage,
  };

const knockedOutOnPlacement =
  pokemonAfterPlacementDamage.currentHp <= 0;

      if (knockedOutOnPlacement) {
  // Le Pokémon est K.O. immédiatement
  setBoard((previousBoard) => ({
    ...previousBoard,
    [cellName]: null,
  }));

  const penalty =
    getKOPenalty(
      selectedCard.stage,
      selectedCard.variant
    );

  if (currentPlayer === 1) {
    setPlayer1Damage(
      (damage) =>
        damage + penalty
    );

    setPlayer1Discard(
      (discard) => [
        ...discard,
        selectedCard,
      ]
    );

    setPlayer1DiscardEnergies(
      (discard) => [
        ...discard,
        ...pokemonToPlace.energies,
      ]
    );
  } else {
    setPlayer2Damage(
      (damage) =>
        damage + penalty
    );

    setPlayer2Discard(
      (discard) => [
        ...discard,
        selectedCard,
      ]
    );

    setPlayer2DiscardEnergies(
      (discard) => [
        ...discard,
        ...pokemonToPlace.energies,
      ]
    );
  }
} else {
  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]:
      pokemonAfterPlacementDamage,
  }));
}

      if (currentPlayer === 1) {
        setPlayer1Hand((hand) =>
          hand.filter(
            (card) => card.id !== selectedCard.id
          )
        );
      } else {
        setPlayer2Hand((hand) =>
          hand.filter(
            (card) => card.id !== selectedCard.id
          )
        );
      }

      setHasPlacedThisTurn(true);

      if (knockedOutOnPlacement) {
  setMessage(
    `${selectedCard.name} est posé en ${cellName}, subit ${placementDamage} dégâts à cause d'un Talent adverse et est K.O. !`
  );
} else if (placementDamage > 0) {
  setMessage(
    `${selectedCard.name} est posé en ${cellName} avec 2 Énergies et subit ${placementDamage} dégâts à cause d'un Talent adverse.`
  );
} else {
  setMessage(
    `${selectedCard.name} est posé en ${cellName} avec 2 Énergies.`
  );
}

      setSelectedCard(null);
      return;
    }

    // SÉLECTION D'UN POKÉMON SUR LE PLATEAU
    if (pokemon) {
      if (pokemon.owner !== currentPlayer) {
        setMessage(
          `Ce Pokémon appartient au joueur ${pokemon.owner}.`
        );
        return;
      }

      setSelectedTrainerCard(null);
      setTrainerEffectActivated(false);
      setSelectedAttachedTool(null);

      setSelectedPokemonCell(cellName);
      setSelectedAttackIndex(null);

      setMessage(
        `${pokemon.card.name} sélectionné en ${cellName}.`
      );

      return;
    }

    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    setMessage(
      'Cette case est vide.'
    );
  }
function retreatSelectedPokemon() {
  if (!selectedPokemonCell) {
    return;
  }
  const pokemon = board[selectedPokemonCell];

  if (!pokemon) {
    return;
  }

  if (pokemon.asleep) {
  setMessage(
    `${pokemon.card.name} est endormi et ne peut pas battre en retraite.`
  );
  return;
}

  if (pokemon.owner !== currentPlayer) {
    setMessage("Ce Pokémon ne t'appartient pas.");
    return;
  }

  if (pokemon.paralyzed) {
  setMessage(
    `${pokemon.card.name} est paralysé et ne peut pas battre en retraite.`
  );
  return;
}

  if (pokemon.hasAttacked) {
  setMessage(
    `${pokemon.card.name} a déjà attaqué pendant ce tour et ne peut donc plus battre en retraite.`
  );
  return;
}

  if (pokemon.hasRetreated) {
    setMessage(
      `${pokemon.card.name} a déjà utilisé sa retraite pendant cette partie.`
    );
    return;
  }

  const row = selectedPokemonCell[0];
  const column = selectedPokemonCell[1];

  let destinationCell: string;

  if (pokemon.owner === 1) {
    if (row !== 'B') {
      setMessage(
        'Le joueur 1 peut uniquement battre en retraite de B vers A.'
      );
      return;
    }

    destinationCell = `A${column}`;
  } else {
    if (row !== 'C') {
      setMessage(
        'Le joueur 2 peut uniquement battre en retraite de C vers D.'
      );
      return;
    }

    destinationCell = `D${column}`;
  }

  if (board[destinationCell]) {
    setMessage(
      `Impossible : la case ${destinationCell} est déjà occupée.`
    );
    return;
  }

  if (
  pokemon.energies.length <
  pokemon.card.retreatCost
) {
    setMessage(
      `${pokemon.card.name} n'a pas assez d'Énergies pour battre en retraite.`
    );
    return;
  }

  const retreatCost =
  pokemon.card.retreatCost;

const discardedEnergies =
  pokemon.energies.slice(
    0,
    retreatCost
  );

const remainingEnergies =
  pokemon.energies.slice(
    retreatCost
  );

  if (pokemon.owner === 1) {
  setPlayer1DiscardEnergies(
    (previous) => [
      ...previous,
      ...discardedEnergies,
    ]
  );
} else {
  setPlayer2DiscardEnergies(
    (previous) => [
      ...previous,
      ...discardedEnergies,
    ]
  );
}

  const newBoard = {
    ...board,
  };

  newBoard[selectedPokemonCell] = null;

 newBoard[destinationCell] = {
  ...pokemon,
  energies: remainingEnergies,
  hasRetreated: true,
};

  setBoard(newBoard);

 

  setSelectedPokemonCell(destinationCell);

  setMessage(
    `${pokemon.card.name} bat en retraite de ${selectedPokemonCell} vers ${destinationCell}.`
  );
}

function handleAttackerKO(
  newBoard: BoardState,
  attacker: PokemonInPlay,
  attackerCell: string
) {
  // L'attaquant est encore vivant
  if (attacker.currentHp > 0) {
    return false;
  }

  if (
  attacker.card.talent?.effect ===
  'surviveKOOnCoin'
) {
  newBoard[attackerCell] = {
    ...attacker,

    currentHp: 0,
  };

  setPendingKOSurvival({
    cellName: attackerCell,

    player: attacker.owner,
  });

  startPokemonCoinFlip(
    attackerCell,
    1
  );

  setMessage(
    `${attacker.card.name} devrait être mis K.O. ! Lance une pièce pour tenter de rester en jeu avec 10 PV.`
  );

  return false;
}

  const penalty =
    getKOPenalty(attacker.card.stage,attacker.card.variant);

  // Libère sa case
  newBoard[attackerCell] = null;

  prepareKOEnergyMove(
  attacker,
  newBoard
);

  // Joueur 1
  if (attacker.owner === 1) {
    setPlayer1Damage(
      (damage) => damage + penalty
    );

    setPlayer1Discard((discard) => [
  ...discard,
  attacker.card,
  ...(attacker.attachedTool
    ? [attacker.attachedTool]
    : []),
]);

    setPlayer1DiscardEnergies((discard) => [
      ...discard,
      ...attacker.energies,
    ]);
  }

  // Joueur 2
  else {
    setPlayer2Damage(
      (damage) => damage + penalty
    );

    setPlayer2Discard((discard) => [
  ...discard,
  attacker.card,
  ...(attacker.attachedTool
    ? [attacker.attachedTool]
    : []),
]);

    setPlayer2DiscardEnergies((discard) => [
      ...discard,
      ...attacker.energies,
    ]);
  }

  return true;
}

function applyAttackStatusToPlayer(
  player: Player,
  attack: Attack,
  sourcePlayer: Player
) {
  const poisonEffect =
    attack.effects?.find(
      (effect) => effect.type === 'poison'
    );

  

  const burnEffect =
    attack.effects?.find(
      (effect) => effect.type === 'burn'
    );


  const extraDamageNextTurnEffect =
  attack.effects?.find(
    (effect) =>
      effect.type ===
        'takeExtraDamageNextTurn'
  );

  function updateStatus(
    previousStatus: PlayerStatusState
  ): PlayerStatusState {
    let newStatus = {
      ...previousStatus,
    };

    // POISON
    if (poisonEffect) {
      newStatus = {
        ...newStatus,
        poisoned: true,
        poisonSourcePlayer: sourcePlayer,
      };
    }

    // BRÛLURE
    if (burnEffect) {
      newStatus = {
        ...newStatus,
        burned: true,
        burnSourcePlayer: sourcePlayer,
        burnTriggersRemaining: 2,
      };
    }

    if (extraDamageNextTurnEffect) {
  newStatus = {
    ...newStatus,

    extraDamageNextTurn:
      extraDamageNextTurnEffect.amount,

    extraDamageNextTurnSourcePlayer:
      sourcePlayer,

    // Pas actif tout de suite
    extraDamageNextTurnReady:
      false,
  };
}

    return newStatus;
  }

  if (player === 1) {
    setPlayer1Status(updateStatus);
  } else {
    setPlayer2Status(updateStatus);
  }
}

function startKOSurvivalTalent(
  pokemon: PokemonInPlay,
  cellName: string,
  newBoard: BoardState
): boolean {
  if (
    pokemon.card.talent?.effect !==
    'surviveKOOnCoin'
  ) {
    return false;
  }

  newBoard[cellName] = {
    ...pokemon,

    currentHp: 0,
  };

  setBoard(newBoard);

  setPendingKOSurvival({
    cellName,

    player: pokemon.owner,
  });

  startPokemonCoinFlip(
    cellName,
    1
  );

  setMessage(
    `${pokemon.card.name} devrait être mis K.O. ! Lance une pièce pour son Talent ${pokemon.card.talent.name}.`
  );

  return true;
}

function doesTalentPreventAllAttackEffects(
  target: PokemonInPlay,
  attacker: PokemonInPlay
): boolean {
  return (
    target.card.talent?.effect ===
      'preventAllEffectsFromExGx' &&

    attacker.owner !== target.owner &&

    (
      attacker.card.variant === 'gx' ||
      attacker.card.variant === 'ex'
    )
  );
}

function doesTalentPreventDamage(
  
  target: PokemonInPlay,
  attacker: PokemonInPlay
): 
boolean {
  if (
  doesTalentPreventAllAttackEffects(
    target,
    attacker
  )
) {
  return true;
}
  const talent =
    target.card.talent;

  if (!talent) {
    return false;
  }

  return (
    talent.type === 'passive' &&
    talent.effect ===
      'preventDamageFromType' &&
    talent.blockedType ===
      attacker.card.type
  );
}

function tryAttackSelectedPokemon() {
  if (!selectedPokemonCell) {
    return;
  }


  
  if (
  !canAttackInCurrentOrder(
    selectedPokemonCell
  )
) {
  setMessage(
    `${selectedPokemonCell} ne peut plus attaquer dans l'ordre choisi ce tour.`
  );
  return;
}



  if (selectedAttackIndex === null) {
    setMessage(
      'Choisis d’abord une attaque.'
    );
    return;
  }

  

  const pokemon =
    board[selectedPokemonCell];

  if (!pokemon) {
    return;
  }

  // --------------------------------
// TALENT PASSIF :
// LES BASE NE PEUVENT PAS ATTAQUER
// --------------------------------

 const baseAttackBlocker =
  getBaseAttackBlocker(
    selectedPokemonCell
  );

 if (baseAttackBlocker) {
  setMessage(
    `${pokemon.card.name} est un Pokémon de Base et ne peut pas attaquer à cause du Talent ${baseAttackBlocker.card.talent?.name} de ${baseAttackBlocker.card.name}.`
  );

  return;
}

  
  if (pokemon.asleep) {
  setMessage(
    `${pokemon.card.name} est endormi et ne peut pas attaquer.`
  );
  return;
}

  const attack =
    pokemon.card.attacks[
      selectedAttackIndex
    ];

  if (
  attack.targetMode ===
    'damagedOpponentOrPlayer'
) {
  const opponent: Player =
    pokemon.owner === 1 ? 2 : 1;

  const hasDamagedOpponentPokemon =
    Object.values(board).some(
      (target) =>
        target !== null &&
        target.owner === opponent &&
        target.currentHp <
          getPokemonMaxHp(target)
    );

  const opponentDamage =
    opponent === 1
      ? player1Damage
      : player2Damage;

  if (
    !hasDamagedOpponentPokemon &&
    opponentDamage <= 0
  ) {
    setMessage(
      'Aucune cible adverse n’a de marqueur de dégâts.'
    );

    return;
  }
}

  

  if (!attack) {
    return;
  }

  if (
  pokemon.blockedAttackName ===
    attack.name &&
  pokemon.blockedAttackTurnId ===
    turnId
) {
  setMessage(
    `${pokemon.card.name} ne peut pas utiliser ${attack.name} pendant ce tour.`
  );

  return;
}

  // Le lancer a déjà été effectué :
  // l'attaque peut partir.
 if (
  readyCoinAttack &&
  readyCoinAttack.cellName ===
    selectedPokemonCell &&
  readyCoinAttack.attackIndex ===
    selectedAttackIndex
) {
  const coinResult =
    readyCoinAttack.coinResult;

  setReadyCoinAttack(null);

  attackSelectedPokemon(
    coinResult
  );

  return;
}

  // L'attaque demande un lancer.
  if (
    attack.coinCount &&
    attack.coinCount > 0
  ) {
    setPendingAttackAfterCoin({
      cellName: selectedPokemonCell,
      attackIndex: selectedAttackIndex,
    });

    startPokemonCoinFlip(
      selectedPokemonCell,
      attack.coinCount
    );

    return;
  }

  // Pas de lancer :
  // attaque normale.
  attackSelectedPokemon();
}

function getTrainerHistoryKey(
  player: Player,
  trainerId: string
): string {
  return `${player}-${trainerId}`;
}

function startTrainerCoinFlip(
  trainer: TrainerCard,
  player: Player,
  coinCount: number
) 

{if (hasAttackedThisTurn) {
  setMessage(
    "Tu ne peux plus jouer de carte Dresseur après avoir attaqué."
  );
  return;
}
  const trainerHistoryKey =
  getTrainerHistoryKey(
    player,
    trainer.id
  );

const history =
  trainerCoinHistories[
    trainerHistoryKey
  ] ?? {};

  const constraints =
    player === 1
      ? player1CoinConstraints
      : player2CoinConstraints;

  const resolution =
    resolveCoinFlip(
      history,
      coinCount,
      constraints
    );

  setPendingCoinFlip({
    sourceType: 'trainer',
    sourceKey: trainer.id,
    sourceName: trainer.name,
    player,
    coinCount,
    resolution,
  });

  if (resolution.choiceAllowed) {
    setCoinDraft(
      Array(coinCount).fill(null)
    );
  } else {
    setCoinDraft(
      resolution.result
        ? [...resolution.result]
        : []
    );
  }
}

function startPokemonCoinFlip(
  cellName: string,
  coinCount: number
) {
  const pokemon = board[cellName];

  if (!pokemon) {
    return;
  }

  const constraints =
    pokemon.owner === 1
      ? player1CoinConstraints
      : player2CoinConstraints;

  const resolution = resolveCoinFlip(
    pokemon.coinHistory,
    coinCount,
    constraints
  );

  setPendingCoinFlip({
    sourceType: 'pokemon',
    sourceKey: cellName,
    sourceName: pokemon.card.name,
    player: pokemon.owner,
    coinCount,
    resolution,
  });

  if (
    resolution.choiceAllowed
  ) {
    setCoinDraft(
      Array(coinCount).fill(null)
    );
  } else {
    setCoinDraft(
      resolution.result
        ? [...resolution.result]
        : []
    );
  }
}

function chooseCoinSide(
  index: number,
  side: CoinSide
) {
  setCoinDraft((previous) => {
    const next = [...previous];

    next[index] = side;

    return next;
  });
}

function getCoinTriggeredEffects(
  attack: Attack,
  coinResult?: CoinSide[]
): AttackEffect[] {
  if (
    !coinResult ||
    !attack.coinEffects
  ) {
    return [];
  }

  const triggeredEffects: AttackEffect[] = [];

  attack.coinEffects.forEach(
    (coinEffect) => {
      const conditionMatched =
  doesCoinConditionMatch(
    coinEffect,
    coinResult
  );

if (conditionMatched) {
  triggeredEffects.push(
    coinEffect.effect
  );
}
    }
  );

  return triggeredEffects;
}

function calculateCoinDamage(
  attack: Attack,
  coinResult?: CoinSide[]
): number {
  if (!coinResult) {
    return attack.damage;
  }

  const faceCount =
    countCoinSide(
      coinResult,
      'face'
    );

  const pileCount =
    countCoinSide(
      coinResult,
      'pile'
    );

  // Dégâts par Face / Pile
  const faceDamage =
    faceCount *
    (attack.damagePerFace ?? 0);

  const pileDamage =
    pileCount *
    (attack.damagePerPile ?? 0);

  // Dégâts conditionnels
  let conditionalDamage = 0;

  attack.coinDamageEffects?.forEach(
    (coinDamage) => {
      const conditionMatched =
        doesCoinDamageConditionMatch(
          coinDamage,
          coinResult
        );

      if (conditionMatched) {
        conditionalDamage +=
          coinDamage.damage;
      }
    }
  );

  return (
    attack.damage +
    faceDamage +
    pileDamage +
    conditionalDamage
  );
}

function doesAttackFailFromCoin(
  attack: Attack,
  coinResult?: CoinSide[]
): boolean {
  if (
    !coinResult ||
    !attack.failsOn
  ) {
    return false;
  }

  return coinResult.includes(
    attack.failsOn
  );
}

function doesCoinDamageConditionMatch(
  coinDamage: CoinConditionalDamage,
  coinResult: CoinSide[]
): boolean {
  const matchingCount =
    countCoinSide(
      coinResult,
      coinDamage.side
    );

  // Au moins un résultat correspondant
  if (
    !coinDamage.condition ||
    coinDamage.condition === 'any'
  ) {
    return matchingCount > 0;
  }

  // Toutes les pièces correspondent
  if (
    coinDamage.condition === 'all'
  ) {
    return (
      matchingCount ===
      coinResult.length
    );
  }

  // Exactement X résultats
  if (
    coinDamage.condition === 'exact'
  ) {
    return (
      matchingCount ===
      (coinDamage.count ?? 0)
    );
  }

  return false;
}


function doesCoinConditionMatch(
  coinEffect: CoinConditionalEffect,
  coinResult: CoinSide[]
): boolean {
  const matchingCount =
    countCoinSide(
      coinResult,
      coinEffect.side
    );

  // Si aucune condition n'est indiquée,
  // on garde l'ancien fonctionnement :
  // au moins une pièce correspond.
  if (
    !coinEffect.condition ||
    coinEffect.condition === 'any'
  ) {
    return matchingCount > 0;
  }

  // Toutes les pièces doivent correspondre.
  if (
    coinEffect.condition === 'all'
  ) {
    return (
      matchingCount ===
      coinResult.length
    );
  }

  // Il faut exactement X résultats.
  if (
    coinEffect.condition === 'exact'
  ) {
    return (
      matchingCount ===
      (coinEffect.count ?? 0)
    );
  }

  return false;
}

function countCoinSide(
  result: CoinSide[] | undefined,
  side: CoinSide
): number {
  if (!result) {
    return 0;
  }

  return result.filter(
    (coin) => coin === side
  ).length;
}

function hasCoinSide(
  result: CoinSide[] | undefined,
  side: CoinSide
): boolean {
  return countCoinSide(
    result,
    side
  ) > 0;
}

function isAllCoinSide(
  result: (CoinSide | null)[] | undefined,
  side: CoinSide
): boolean {
  return (
    !!result &&
    result.length > 0 &&
    result.every(
      (coin) => coin === side
    )
  );
}

function validatePendingCoinFlip() {
  if (!pendingCoinFlip) {
    return;
  }

  let finalResult: CoinSide[];

  if (
    pendingCoinFlip.resolution.choiceAllowed
  ) {
    const incomplete =
      coinDraft.some(
        (side) => side === null
      );

    if (incomplete) {
      setMessage(
        'Choisis Face ou Pile pour chaque pièce.'
      );
      return;
    }

    finalResult = coinDraft.map(
      (side) => side as CoinSide
    );
  } else {
    if (
      !pendingCoinFlip.resolution.result
    ) {
      return;
    }

    finalResult = [
      ...pendingCoinFlip.resolution.result,
    ];
  }

// ---------------------------------
// PLUSIEURS PIÈCES : TOUT FACE
// seulement après un TOUT PILE
// ---------------------------------

if (
  pendingCoinFlip.coinCount > 1 &&
  pendingCoinFlip.resolution.choiceAllowed &&
  isAllCoinSide(
    finalResult,
    'face'
  )
) {
  let previousResult:
    | CoinSide[]
    | undefined;

  // Pokémon
  if (
    pendingCoinFlip.sourceType ===
    'pokemon'
  ) {
    const pokemon =
      board[
        pendingCoinFlip.sourceKey
      ];

    previousResult =
      pokemon?.coinHistory[
        pendingCoinFlip.coinCount
      ];
  }

 // Dresseur
else {
  const trainerHistoryKey =
    getTrainerHistoryKey(
      pendingCoinFlip.player,
      pendingCoinFlip.sourceKey
    );

  previousResult =
    trainerCoinHistories[
      trainerHistoryKey
    ]?.[
      pendingCoinFlip.coinCount
    ];
}

  if (
    !isAllCoinSide(
      previousResult,
      'pile'
    )
  ) {
    setMessage(
      `Tu ne peux choisir tout FACE que si le dernier lancer de ${pendingCoinFlip.coinCount} pièces de cet acteur était entièrement PILE.`
    );

    return;
  }
}

  // -----------------------------
  // ENREGISTRER L'HISTORIQUE
  // DU POKÉMON
  // -----------------------------

  if (
  pendingCoinFlip.sourceType ===
  'pokemon'
) {
  setBoard((previousBoard) => {
    const pokemon =
      previousBoard[
        pendingCoinFlip.sourceKey
      ];

    if (!pokemon) {
      return previousBoard;
    }

    return {
      ...previousBoard,

      [pendingCoinFlip.sourceKey]: {
        ...pokemon,

        coinHistory:
          saveCoinResult(
            pokemon.coinHistory,
            pendingCoinFlip.coinCount,
            finalResult
          ),
      },
    };
  });
} else {
  const trainerHistoryKey =
    getTrainerHistoryKey(
      pendingCoinFlip.player,
      pendingCoinFlip.sourceKey
    );

  setTrainerCoinHistories(
    (previous) => {
      const history =
        previous[
          trainerHistoryKey
        ] ?? {};

      return {
        ...previous,

        [trainerHistoryKey]:
          saveCoinResult(
            history,
            pendingCoinFlip.coinCount,
            finalResult
          ),
      };
    }
  );
}

  // -----------------------------
  // CONSOMMER LA CONTRAINTE
  // DRESSEUR SI NÉCESSAIRE
  // -----------------------------
// --------------------------------
// CONSOMMER UNE CONTRAINTE DRESSEUR
// --------------------------------

if (
  pendingCoinFlip.resolution
    .consumeTrainerConstraint
) {
  if (pendingCoinFlip.player === 1) {
    setPlayer1CoinConstraints(
      (previous) =>
        consumeCoinConstraint(
          previous,
          pendingCoinFlip.coinCount
        )
    );
  } else {
    setPlayer2CoinConstraints(
      (previous) =>
        consumeCoinConstraint(
          previous,
          pendingCoinFlip.coinCount
        )
    );
  }
}


  if (
  pendingCoinFlip.sourceType ===
  'trainer'
) {
  if (
    pendingCoinFlip.player === 1
  ) {
    setPlayer1CoinConstraints(
      (previous) =>
        addTrainerCoinConstraint(
          previous,
          pendingCoinFlip.coinCount,
          finalResult
        )
        
    );
  } else {
    setPlayer2CoinConstraints(
      (previous) =>
        addTrainerCoinConstraint(
          previous,
          pendingCoinFlip.coinCount,
          finalResult
        )
    );
  }
}

if (
  pendingCoinFlip.sourceType ===
  'trainer'
) {
  const trainerId =
    pendingCoinFlip.sourceKey;

  if (pendingCoinFlip.player === 1) {
    const trainerCard =
      player1Hand.find(
        (card): card is TrainerCard =>
          card.id === trainerId &&
          !isPokemonCard(card)
      );

    if (trainerCard) {
      setPlayer1Hand(
        (previous) =>
          previous.filter(
            (card) =>
              card.id !== trainerId
          )
      );

      setPlayer1Discard(
        (previous) => [
          ...previous,
          trainerCard,
        ]
      );

      if (
        trainerCard.category ===
        'supporter'
      ) {
        setHasUsedSupporterThisTurn(
          true
        );
      }
    }
  } else {
    const trainerCard =
      player2Hand.find(
        (card) : card is TrainerCard =>
          card.id === trainerId &&
          !isPokemonCard(card)
      );

    if (trainerCard) {
      setPlayer2Hand(
        (previous) =>
          previous.filter(
            (card) =>
              card.id !== trainerId
          )
      );

      setPlayer2Discard(
        (previous) => [
          ...previous,
          trainerCard,
        ]
      );

      if (
        trainerCard.category ===
        'supporter'
      ) {
        setHasUsedSupporterThisTurn(
          true
        );
      }
    }
  }

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
}

// =====================================
// OBJET : RAPPEL CHANCEUX
// =====================================

if (
  pendingCoinFlip.sourceType ===
    'trainer' &&
  pendingCoinFlip.sourceKey ===
    super_rappel.id
) {
  const result =
    finalResult[0];

  if (result === 'face') {
    setPendingCoinReturnToHand({
      player:
        pendingCoinFlip.player,
    });

    setMessage(
      '🪙 FACE ! Choisis l’un de tes Pokémon à remettre dans ta main.'
    );
  } else {
    setMessage(
      '🪙 PILE ! Rappel n’a aucun effet.'
    );
  }

  setPendingCoinFlip(null);
  setCoinDraft([]);

  return;
}

  const resultText =
    finalResult
      .map((side) =>
        side === 'face'
          ? 'FACE'
          : 'PILE'
      )
      .join(' / ');

  if (
  pendingAttackAfterCoin &&
  pendingAttackAfterCoin.cellName ===
    pendingCoinFlip.sourceKey
) {
  setReadyCoinAttack({
    ...pendingAttackAfterCoin,
    coinResult: [...finalResult],
  });

  setPendingAttackAfterCoin(null);

  setMessage(
    `🪙 ${pendingCoinFlip.sourceName} : ${resultText}. Lancer validé ! Appuie de nouveau sur Attaquer.`
  );
} else {
  setMessage(
    `🪙 ${pendingCoinFlip.sourceName} : ${resultText}`
  );
}

// =====================================
// TALENT SCARHINO : SURVIE AU K.O.
// =====================================

if (
  pendingKOSurvival &&
  pendingCoinFlip.sourceType ===
    'pokemon' &&
  pendingCoinFlip.sourceKey ===
    pendingKOSurvival.cellName
) {
  const result =
    finalResult[0];

  const pokemon =
    board[
      pendingKOSurvival.cellName
    ];

  if (!pokemon) {
    setPendingKOSurvival(null);

    setPendingCoinFlip(null);
    setCoinDraft([]);

    return;
  }

  // -----------------------------
  // FACE : SCARHINO SURVIT
  // -----------------------------

  if (result === 'face') {
    setBoard(
      (previousBoard) => {
        const currentPokemon =
          previousBoard[
            pendingKOSurvival
              .cellName
          ];

        if (!currentPokemon) {
          return previousBoard;
        }

        return {
          ...previousBoard,

          [pendingKOSurvival
            .cellName]: {
            ...currentPokemon,

            currentHp: 10,
          },
        };
      }
    );

    setMessage(
      `🪙 FACE ! ${pokemon.card.name} évite le K.O. grâce à ${pokemon.card.talent?.name} et reste en jeu avec 10 PV.`
    );
  }

  // -----------------------------
  // PILE : K.O. NORMAL
  // -----------------------------

  else {
    const penalty =
      getKOPenalty(
        pokemon.card.stage,
        pokemon.card.variant
      );

    setBoard(
      (previousBoard) => ({
        ...previousBoard,

        [pendingKOSurvival
          .cellName]: null,
      })
    );

    if (pokemon.owner === 1) {
      setPlayer1Damage(
        (damage) =>
          damage + penalty
      );

      setPlayer1DiscardEnergies(
        (discard) => [
          ...discard,
          ...pokemon.energies,
        ]
      );

      setPlayer1Discard(
        (discard) => [
          ...discard,

          pokemon.card,

          ...(pokemon.attachedTool
            ? [
                pokemon
                  .attachedTool,
              ]
            : []),
        ]
      );
    } else {
      setPlayer2Damage(
        (damage) =>
          damage + penalty
      );

      setPlayer2DiscardEnergies(
        (discard) => [
          ...discard,
          ...pokemon.energies,
        ]
      );

      setPlayer2Discard(
        (discard) => [
          ...discard,

          pokemon.card,

          ...(pokemon.attachedTool
            ? [
                pokemon
                  .attachedTool,
              ]
            : []),
        ]
      );
    }

    setMessage(
      `🪙 PILE ! ${pokemon.card.name} est mis K.O.`
    );
  }

  setPendingKOSurvival(null);

  setPendingCoinFlip(null);
  setCoinDraft([]);

  return;
}

if (
  pendingSleepResolution &&
  pendingCoinFlip.sourceType ===
    'pokemon' &&
  pendingSleepResolution.sourceCell ===
    pendingCoinFlip.sourceKey
) {
  const sleepCoin =
    finalResult[0];

  setBoard((previousBoard) => {
    const target =
      previousBoard[
        pendingSleepResolution.targetCell
      ];

    if (!target) {
      return previousBoard;
    }

    const sleepEndPlayer =
      sleepCoin === 'face'
        ? target.owner
        : pendingSleepResolution.sourcePlayer;

    return {
      ...previousBoard,

      [pendingSleepResolution.targetCell]: {
        ...target,

        asleep: true,

        sleepSourcePlayer:
          pendingSleepResolution.sourcePlayer,

        sleepEndPlayer,
      },
    };
  });

  setPendingSleepResolution(null);
}

  setPendingCoinFlip(null);
  setCoinDraft([]);
}

  function attackSelectedPokemon(
  coinResult?: CoinSide[]
) {
    if (!selectedPokemonCell) return;

    if (
  !canAttackInCurrentOrder(
    selectedPokemonCell
  )
) {
  setMessage(
    `${selectedPokemonCell} ne peut plus attaquer dans l'ordre choisi ce tour.`
  );
  return;
}

    const attacker =
      board[selectedPokemonCell];

    if (!attacker) return;

    if (attacker.asleep) {
  setMessage(
    `${attacker.card.name} est endormi et ne peut pas attaquer.`
  );
  return;
}

    if (attacker.owner !== currentPlayer) {
      return;
    }

    if (attacker.paralyzed) {
  setMessage(
    `${attacker.card.name} est paralysé et ne peut pas attaquer pendant ce tour.`
  );
  return;
}

    if (attacker.hasAttacked) {
      setMessage(
        `${attacker.card.name} a déjà attaqué pendant ce tour.`
      );
      return;
    }

    if (selectedAttackIndex === null) {
  setMessage(
    `Choisis d'abord une attaque de ${attacker.card.name}.`
  );
  return;
}

const attack =
  attacker.card.attacks[selectedAttackIndex];

if (coinResult) {
  const resultText =
    coinResult
      .map((side) =>
        side === 'face'
          ? 'FACE'
          : 'PILE'
      )
      .join(' / ');

  console.log(
    'Résultat du lancer :',
    resultText
  );
}

const coinTriggeredEffects =
  getCoinTriggeredEffects(
    attack,
    coinResult
  );

const resolvedAttack: Attack = {
  ...attack,

  effects: [
    ...(attack.effects ?? []),
    ...coinTriggeredEffects,
  ],
};

const switchEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
      'switchWithBench'
  );

const benchEnergyEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
        'recoverEnergyToBench' &&
      effect.energyType
  );

// --------------------------------
// DÉFAUSSE TOUTES LES ÉNERGIES
// D'UN TYPE POUR AUGMENTER LES DÉGÂTS
// --------------------------------

const discardAllForBonusEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
        'discardAllTypedEnergyForBonus' &&
      effect.energyType
  );

const energiesDiscardedForBonus =
  discardAllForBonusEffect?.energyType
    ? attacker.energies.filter(
        (energy) =>
          energy ===
          discardAllForBonusEffect.energyType
      )
    : [];

const switchedRecently =
  attacker.lastSwitchedTurnId !==
    undefined &&
  (
    attacker.lastSwitchedTurnId ===
      turnId ||

    attacker.lastSwitchedTurnId ===
      turnId - 1
  );

const switchedRecentlyBonus =
  switchedRecently
    ? (
        attack
          .bonusDamageIfSwitchedRecently
        ?? 0
      )
    : 0;

const everyTwoRoundsBonus =
  Math.floor(round / 2) *
  (
    attack.bonusDamageEveryTwoRounds
    ?? 0
  );

let totalDamage =
  calculateCoinDamage(
    attack,
    coinResult
  ) +
  switchedRecentlyBonus +
  everyTwoRoundsBonus;

if (discardAllForBonusEffect) {
  totalDamage +=
    energiesDiscardedForBonus.length *
    discardAllForBonusEffect.amount;
}

const attackFailed =
  doesAttackFailFromCoin(
    attack,
    coinResult
  );
if (switchEffect) {
  const attackerRow =
    selectedPokemonCell[0];

  const hasPokemonToSwitch =
  Object.entries(board).some(
    ([cellName, pokemon]) =>
      pokemon !== null &&
      pokemon.owner ===
        attacker.owner &&
      cellName !==
        selectedPokemonCell &&
      cellName[0] ===
        attackerRow
  );

  if (hasPokemonToSwitch) {
    setPendingPokemonSwitch({
      player: attacker.owner,
      attackerCell:
        selectedPokemonCell,
    });

    setMessage(
      `Choisis un Pokémon de la ligne ${attackerRow} avec lequel échanger ${attacker.card.name}.`
    );
  }
}

if (
  benchEnergyEffect &&
  benchEnergyEffect.energyType
) {
  const discardEnergies =
    attacker.owner === 1
      ? player1DiscardEnergies
      : player2DiscardEnergies;

  const hasRequiredEnergy =
    discardEnergies.some(
      (energy) =>
        energy ===
        benchEnergyEffect.energyType
    );

  const hasBenchPokemon =
  Object.entries(board).some(
    ([cellName, pokemon]) =>
      pokemon !== null &&
      pokemon.owner === attacker.owner &&
      cellName !== selectedPokemonCell
  );

  if (
    hasRequiredEnergy &&
    hasBenchPokemon
  ) {
    setPendingBenchEnergyAttachment({
      player: attacker.owner,
      attackerCell:
        selectedPokemonCell,
      energyType:
        benchEnergyEffect.energyType,
      amount:
        benchEnergyEffect.amount,
    });

    setMessage(
      `Choisis un Pokémon de banc auquel attacher une Énergie ${benchEnergyEffect.energyType}.`
    );
  }
}

if (!attack) {
  setMessage("Cette attaque n'existe pas.");
  return;
}

if (
  !canPayAttackCost(
    attacker.energies,
    attack
  )
) {
  setMessage(
    `${attacker.card.name} n'a pas les Énergies nécessaires. Coût : ${formatAttackCost(attack)}.`
  );

  return;
}

if (
  !canPayTypedDiscard(
    attacker.energies,
    attack
  )
) {
  setMessage(
    `${attacker.card.name} doit pouvoir défausser les Énergies demandées par cette attaque.`
  );
  return;
}

setHasAttackedThisTurn(true);

advanceAttackOrder(
  selectedPokemonCell,
  attacker.owner
);

if (attackFailed) {
  const newBoard = {
    ...board,
  };

  const confusedDamage =
    attacker.confused ? 30 : 0;

  const failedAttacker = {
    ...attacker,

    currentHp:
      attacker.currentHp -
      confusedDamage,

    hasAttacked: true,
  };

  newBoard[selectedPokemonCell] =
    failedAttacker;

  const attackerKO =
    handleAttackerKO(
      newBoard,
      failedAttacker,
      selectedPokemonCell
    );

  setBoard(newBoard);

  setMessage(
    attackerKO
      ? `🪙 PILE ! ${attacker.card.name} rate son attaque et est K.O.`
      : `🪙 PILE ! ${attacker.card.name} rate son attaque.`
  );

  setSelectedAttackIndex(null);

  return;
}

// ========================================
// SOIGNE TOUS LES POKÉMON
// + REMET L'ATTAQUANT DANS LA MAIN
// ========================================

const healAllAndReturnEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
      'healAllOwnAndReturnSelf'
  );

if (healAllAndReturnEffect) {
  const newBoard: BoardState = {
    ...board,
  };

  // -----------------------------
  // SOIGNE TOUS LES POKÉMON
  // DU JOUEUR
  // -----------------------------

  Object.entries(newBoard).forEach(
    ([cellName, pokemon]) => {
      if (!pokemon) {
        return;
      }

      if (
        pokemon.owner !==
        attacker.owner
      ) {
        return;
      }

      newBoard[cellName] = {
        ...pokemon,

        currentHp:
          getPokemonMaxHp(
            pokemon
          ),
      };
    }
  );

  // -----------------------------
  // BLOCAGE DE REPOSE
  // COMME MARGIE / SUPER RAPPEL
  // -----------------------------

  const placementLockKey =
    getPokemonLockKey(
      attacker.owner,
      attacker.card.id
    );

  if (
    attacker.card.stage ===
    'niveau1'
  ) {
    setPokemonPlacementLocks(
      (previous) => ({
        ...previous,

        [placementLockKey]:
          round,
      })
    );
  }

  if (
    attacker.card.stage ===
    'niveau2'
  ) {
    setPokemonPlacementLocks(
      (previous) => ({
        ...previous,

        [placementLockKey]:
          round + 1,
      })
    );
  }

  // -----------------------------
  // POKÉMON + OUTIL -> MAIN
  // -----------------------------

  if (attacker.owner === 1) {
    setPlayer1Hand(
      (hand) => [
        ...hand,

        attacker.card,

        ...(attacker.attachedTool
          ? [
              attacker
                .attachedTool,
            ]
          : []),
      ]
    );
  } else {
    setPlayer2Hand(
      (hand) => [
        ...hand,

        attacker.card,

        ...(attacker.attachedTool
          ? [
              attacker
                .attachedTool,
            ]
          : []),
      ]
    );
  }

  // -----------------------------
  // ÉNERGIES
  // -----------------------------
  // On ne fait volontairement PAS :
  //
  // setPlayer1DiscardEnergies(...)
  // setPlayer2DiscardEnergies(...)
  //
  // Les Énergies disparaissent.

  // Retire l'attaquant du plateau.
  newBoard[
    selectedPokemonCell
  ] = null;

  setBoard(newBoard);

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `${attacker.card.name} soigne tous les Pokémon du joueur ${attacker.owner}, puis retourne dans la main` +
      (
        attacker.attachedTool
          ? ` avec ${attacker.attachedTool.name}.`
          : '.'
      )
  );

  return;
}

const confusionDamage =
  attacker.confused ? 30 : 0;

// Ex : B1 -> colonne 1
const column =
  selectedPokemonCell.substring(1);

    /*
      J1 attaque :
      C puis D

      J2 attaque :
      B puis A
    */
    const targetCells =
      attacker.owner === 1
        ? [`C${column}`, `D${column}`]
        : [`B${column}`, `A${column}`];

    const targetCell = targetCells.find(
      (cell) => board[cell] !== null
    );

    // --------------------------------
// BONUS PAR POKÉMON DE BANC ADVERSE
// --------------------------------

const opponentBenchCount =
  Object.entries(board).filter(
    ([cellName, pokemon]) =>
      pokemon !== null &&
      pokemon.owner !==
        attacker.owner &&

      // Le Pokémon qui reçoit
      // l'attaque n'est PAS
      // considéré comme étant au banc
      cellName !== targetCell
  ).length;

const opponentBenchBonus =
  opponentBenchCount *
  (
    attack
      .bonusDamagePerOpponentBenchPokemon
      ?? 0
  );

    const newBoard = { ...board };

const discardEnergyEffect =
  attack.effects?.find(
    (effect) =>
      effect.type === 'discardEnergy'
  );

if (discardEnergyEffect) {
  const numberToDiscard = Math.min(
    discardEnergyEffect.amount,
    attacker.energies.length
  );

  const discardedEnergies =
    attacker.energies.slice(
      attacker.energies.length -
        numberToDiscard
    );

  if (attacker.owner === 1) {
    setPlayer1DiscardEnergies(
      (discard) => [
        ...discard,
        ...discardedEnergies,
      ]
    );
  } else {
    setPlayer2DiscardEnergies(
      (discard) => [
        ...discard,
        ...discardedEnergies,
      ]
    );
  }
}



   let attackerAfterEffect =
  applyAttackEffects(attacker, resolvedAttack);

  // --------------------------------
// RÉDUCTION DES DÉGÂTS
// AU PROCHAIN TOUR ADVERSE
// --------------------------------

const damageReductionEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
      'reduceDamageNextOpponentTurn'
  );

if (damageReductionEffect) {
  const opponent: Player =
    attacker.owner === 1 ? 2 : 1;

  attackerAfterEffect = {
    ...attackerAfterEffect,

    attackDamageReduction:
      damageReductionEffect.amount,

    attackDamageReductionEndPlayer:
      opponent,
  };
}

  // --------------------------------
// RETIRE LES ÉNERGIES UTILISÉES
// POUR LE BONUS
// --------------------------------

if (
  discardAllForBonusEffect?.energyType &&
  energiesDiscardedForBonus.length > 0
) {
  const discardedType =
    discardAllForBonusEffect.energyType;

  attackerAfterEffect = {
    ...attackerAfterEffect,

    energies:
      attackerAfterEffect.energies.filter(
        (energy) =>
          energy !== discardedType
      ),
  };

  if (attacker.owner === 1) {
    setPlayer1DiscardEnergies(
      (discard) => [
        ...discard,
        ...energiesDiscardedForBonus,
      ]
    );
  } else {
    setPlayer2DiscardEnergies(
      (discard) => [
        ...discard,
        ...energiesDiscardedForBonus,
      ]
    );
  }
}

  const recoverEnergyEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type === 'recoverEnergy' &&
      effect.energyType
  );

if (
  recoverEnergyEffect &&
  recoverEnergyEffect.energyType
) {
  const discardEnergies =
    attacker.owner === 1
      ? player1DiscardEnergies
      : player2DiscardEnergies;

  const newDiscard = [
    ...discardEnergies,
  ];

  const recoveredEnergies: EnergyType[] =
    [];

  for (
    let i = 0;
    i < recoverEnergyEffect.amount;
    i++
  ) {
    const energyIndex =
      newDiscard.findIndex(
        (energy) =>
          energy ===
          recoverEnergyEffect.energyType
      );

    if (energyIndex === -1) {
      break;
    }

    recoveredEnergies.push(
      newDiscard[energyIndex]
    );

    newDiscard.splice(
      energyIndex,
      1
    );
  }

  if (recoveredEnergies.length > 0) {
    attackerAfterEffect = {
      ...attackerAfterEffect,

      energies: [
        ...attackerAfterEffect.energies,
        ...recoveredEnergies,
      ],
    };

    if (attacker.owner === 1) {
      setPlayer1DiscardEnergies(
        newDiscard
      );
    } else {
      setPlayer2DiscardEnergies(
        newDiscard
      );
    }
  }
}

  const attackerAfterConfusion = {
  ...attackerAfterEffect,

  currentHp:
    attackerAfterEffect.currentHp -
    confusionDamage,
};

newBoard[selectedPokemonCell] = {
  ...attackerAfterConfusion,

  hasAttacked: true,

  blockedAttackName:
    attack.blocksNextOwnTurn
      ? attack.name
      : attackerAfterConfusion
          .blockedAttackName,

  blockedAttackTurnId:
    attack.blocksNextOwnTurn
      ? turnId + 2
      : attackerAfterConfusion
          .blockedAttackTurnId,
};

// =====================================
// ATTACHER UNE ÉNERGIE CRÉÉE
// À UN POKÉMON DE BANC
// =====================================

const attachEnergyToBenchEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
        'attachEnergyToBench' &&
      effect.energyType
  );

if (
  attachEnergyToBenchEffect &&
  attachEnergyToBenchEffect.energyType
) {
  const hasBenchPokemon =
    Object.entries(board).some(
      ([cellName, pokemon]) =>
        pokemon !== null &&
        pokemon.owner ===
          attacker.owner &&
        cellName !==
          selectedPokemonCell
    );

  if (hasBenchPokemon) {
    setBoard(newBoard);

    setPendingGeneratedBenchEnergy({
      player: attacker.owner,

      attackerCell:
        selectedPokemonCell,

      energyType:
        attachEnergyToBenchEffect
          .energyType,

      amount:
        attachEnergyToBenchEffect
          .amount,
    });

    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    setMessage(
      `Choisis l’un de tes Pokémon de banc pour lui attacher une Énergie ${attachEnergyToBenchEffect.energyType}.`
    );

    return;
  }

  setBoard(newBoard);

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `${attacker.card.name} utilise ${attack.name}, mais aucun Pokémon de banc ne peut recevoir l'Énergie.`
  );

  return;
}

// --------------------------------
// CIBLE LIBRE : N'IMPORTE QUEL
// POKÉMON ADVERSE
// --------------------------------

if (
  attack.targetMode ===
    'anyOpponentPokemon' ||
  attack.targetMode ===
    'damagedOpponentOrPlayer'
) {
  let specialAttacker = {
  ...attackerAfterConfusion,

  hasAttacked: true,

  blockedAttackName:
    attack.blocksNextOwnTurn
      ? attack.name
      : attackerAfterConfusion
          .blockedAttackName,

  blockedAttackTurnId:
    attack.blocksNextOwnTurn
      ? turnId + 2
      : attackerAfterConfusion
          .blockedAttackTurnId,
};

  const typedDiscardEffect =
    resolvedAttack.effects?.find(
      (effect) =>
        effect.type ===
          'discardTypedEnergy' &&
        effect.energyType
    );

  if (
    typedDiscardEffect &&
    typedDiscardEffect.energyType
  ) {
    const remainingEnergies = [
      ...specialAttacker.energies,
    ];

    const discardedEnergies: EnergyType[] =
      [];

    for (
      let i = 0;
      i < typedDiscardEffect.amount;
      i++
    ) {
      const energyIndex =
        remainingEnergies.findIndex(
          (energy) =>
            energy ===
            typedDiscardEffect.energyType
        );

      if (energyIndex === -1) {
        break;
      }

      discardedEnergies.push(
        remainingEnergies[energyIndex]
      );

      remainingEnergies.splice(
        energyIndex,
        1
      );
    }

    specialAttacker = {
      ...specialAttacker,
      energies: remainingEnergies,
    };

    if (attacker.owner === 1) {
      setPlayer1DiscardEnergies(
        (previous) => [
          ...previous,
          ...discardedEnergies,
        ]
      );
    } else {
      setPlayer2DiscardEnergies(
        (previous) => [
          ...previous,
          ...discardedEnergies,
        ]
      );
    }
  }

  newBoard[selectedPokemonCell] =
    specialAttacker;

  setBoard(newBoard);

  setPendingOpponentTarget({
  player: attacker.owner,

  attackerCell:
    selectedPokemonCell,

  damage: totalDamage,

  mode:
    attack.targetMode ===
      'damagedOpponentOrPlayer'
      ? 'damagedOpponentOrPlayer'
      : 'anyOpponentPokemon',

  excludedCell: null,
});

setMessage(
  attack.targetMode ===
    'damagedOpponentOrPlayer'
    ? `${attacker.card.name} utilise ${attack.name}. Choisis un Pokémon adverse blessé ou la carte du joueur adverse s’il a déjà subi des dégâts.`
    :`${attacker.card.name} utilise ${attack.name}. Choisis un Pokémon adverse ou la carte du joueur adverse.`
);

return;
}
    // UN POKÉMON EST TOUCHÉ
    if (targetCell) {
      const target = board[targetCell];

      if (!target) return;

      const attackEffectsPrevented =
  doesTalentPreventAllAttackEffects(
    target,
    attacker
  );
     // Dégâts de l'attaque avant
// les protections de la cible
const fixedDamage =
  attack.fixedDamage;

const isFixedDamageAttack =
  fixedDamage !== undefined;

let attackDamage: number =
  fixedDamage ??
  (
    totalDamage +
    opponentBenchBonus
  );


// Bonus contre Pokémon évolué
if (
  !isFixedDamageAttack &&
  attack.bonusDamageIfTargetEvolved &&
  target.card.stage !== 'base'
) {
  attackDamage +=
    attack.bonusDamageIfTargetEvolved;
}


// Talent qui empêche les dégâts
const damagePrevented =
  isFixedDamageAttack
    ? false
    : doesTalentPreventDamage(
        target,
        attacker
      );


// Réduction de dégâts
const activeDamageReduction =
  isFixedDamageAttack
    ? 0
    : (
        target
          .attackDamageReductionEndPlayer ===
        attacker.owner
          ? target
              .attackDamageReduction ?? 0
          : 0
      );


// Dégâts finaux
const damageToTarget =
  isFixedDamageAttack
    ? attack.fixedDamage!
    : (
        damagePrevented
          ? 0
          : Math.max(
              0,
              attackDamage -
                activeDamageReduction
            )
      );

const hasDrainEffect =
  resolvedAttack.effects?.some(
    (effect: AttackEffect) =>
      effect.type ===
      'healSelfByDamageDealt'
  ) ?? false;

if (
  hasDrainEffect &&
  damageToTarget > 0
) {
  const currentAttacker =
    newBoard[
      selectedPokemonCell
    ];

  if (currentAttacker) {
    const attackerMaxHp =
      getPokemonMaxHp(
        currentAttacker
      );

    newBoard[
      selectedPokemonCell
    ] = {
      ...currentAttacker,

      currentHp:
        Math.min(
          attackerMaxHp,

          currentAttacker.currentHp +
            damageToTarget
        ),
    };
  }
}

const attackerAfterDrain =
  newBoard[
    selectedPokemonCell
  ] ?? attackerAfterConfusion;

const remainingHp =
  target.currentHp -
  damageToTarget;

// --------------------------------
// DÉGÂTS AUX POKÉMON DE BANC
// AYANT LE MÊME TYPE QUE LA CIBLE
// --------------------------------

const benchSameTypeDamage =
  attack.benchDamageSameTypeAsTarget
    ?? 0;

const damagedBenchPokemonNames:
  string[] = [];

if (benchSameTypeDamage > 0) {
  Object.entries(board).forEach(
    ([benchCell, benchPokemon]) => {

      if (!benchPokemon) {
        return;
      }

      // Ce doit être un Pokémon adverse
      if (
        benchPokemon.owner !==
        target.owner
      ) {
        return;
      }

      // Le Pokémon qui reçoit
      // l'attaque principale n'est
      // PAS un Pokémon de banc
      if (
        benchCell === targetCell
      ) {
        return;
      }

      // Même type que le Pokémon actif
      if (
        benchPokemon.card.type !==
        target.card.type
      ) {
        return;
      }

      // --------------------------------
      // PROTECTIONS CONTRE LES DÉGÂTS
      // --------------------------------

      const benchDamagePrevented =
        doesTalentPreventDamage(
          benchPokemon,
          attacker
        );

      const benchDamageReduction =
        benchPokemon
          .attackDamageReductionEndPlayer ===
          attacker.owner
          ? benchPokemon
              .attackDamageReduction ?? 0
          : 0;

      const actualBenchDamage =
        benchDamagePrevented
          ? 0
          : Math.max(
              0,
              benchSameTypeDamage -
                benchDamageReduction
            );

      if (actualBenchDamage <= 0) {
        return;
      }

      const newBenchHp =
        benchPokemon.currentHp -
        actualBenchDamage;

      damagedBenchPokemonNames.push(
        `${benchPokemon.card.name} (-${actualBenchDamage})`
      );

      // ------------------------------
      // K.O. DU POKÉMON DE BANC
      // ------------------------------

      if (newBenchHp <= 0) {
        const penalty =
          getKOPenalty(
            benchPokemon.card.stage,
            benchPokemon.card.variant
          );

        newBoard[benchCell] = null;

        prepareKOEnergyMove(
  benchPokemon,
  newBoard
);

        if (
          benchPokemon.owner === 1
        ) {
          setPlayer1Damage(
            (damage) =>
              damage + penalty
          );

          setPlayer1DiscardEnergies(
            (discard) => [
              ...discard,
              ...benchPokemon.energies,
            ]
          );

          setPlayer1Discard(
            (discard) => [
              ...discard,
              benchPokemon.card,

              ...(benchPokemon.attachedTool
                ? [
                    benchPokemon
                      .attachedTool,
                  ]
                : []),
            ]
          );
        } else {
          setPlayer2Damage(
            (damage) =>
              damage + penalty
          );

          setPlayer2DiscardEnergies(
            (discard) => [
              ...discard,
              ...benchPokemon.energies,
            ]
          );

          setPlayer2Discard(
            (discard) => [
              ...discard,
              benchPokemon.card,

              ...(benchPokemon.attachedTool
                ? [
                    benchPokemon
                      .attachedTool,
                  ]
                : []),
            ]
          );
        }

        return;
      }

      // Le Pokémon de banc survit
      newBoard[benchCell] = {
        ...benchPokemon,
        currentHp: newBenchHp,
      };
    }
  );
}

      // K.O.
      if (remainingHp <= 0) {
        if (
  startKOSurvivalTalent(
    {
      ...target,

      currentHp: remainingHp,
    },

    targetCell,

    newBoard
  )
) {
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return;
}
        const penalty =
          getKOPenalty(target.card.stage,target.card.variant);

        newBoard[targetCell] = null;

        prepareKOEnergyMove(
  target,
  newBoard
);

        if (target.owner === 1) {
          setPlayer1Damage(
            (damage) => damage + penalty
          );

          setPlayer1DiscardEnergies(
    (discard) => [
      ...discard,
      ...target.energies,
    ]
  );

         setPlayer1Discard((discard) => [
  ...discard,
  target.card,
  ...(target.attachedTool
    ? [target.attachedTool]
    : []),
]);
        } else {
          setPlayer2Damage(
            (damage) => damage + penalty
          );

          setPlayer2DiscardEnergies(
    (discard) => [
      ...discard,
      ...target.energies,
    ]
  );

          setPlayer2Discard((discard) => [
  ...discard,
  target.card,
  ...(target.attachedTool
    ? [target.attachedTool]
    : []),
]);
        }
       const attackerKO = handleAttackerKO(
  newBoard,
  attackerAfterDrain,
  selectedPokemonCell
);

setBoard(newBoard);
setSelectedPokemonCell(null);
setSelectedAttackIndex(null);

if (
  startBenchOrPlayerDamageTarget(
    attacker,
    selectedPokemonCell,
    attack,
    targetCell
  )
) {
  setMessage(
    `${target.card.name} est K.O. Choisis maintenant un Pokémon de banc adverse ou la carte du joueur adverse pour les 30 dégâts supplémentaires.`
  );

  return;
}

setMessage(
  `${attacker.card.name} utilise ${attack.name} ! ` +
  `${target.card.name} subit ${damageToTarget} dégâts et est K.O. ! ` +
  `Le joueur ${target.owner} reçoit +${penalty} dégâts.` +
  (
    damagedBenchPokemonNames.length > 0
      ? ` Pokémon de banc touchés : ${damagedBenchPokemonNames.join(', ')}.`
      : ''
  ) +
  (
    attackerKO
      ? ` ${attacker.card.name} est également K.O. à cause du recul !`
      : ''
  )
);

return;

      }

    const poisonEffect =
  attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect) =>
          effect.type === 'poison'
      );

const burnEffect =
  attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect) =>
          effect.type === 'burn'
      );

const paralysisEffect =
  attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect) =>
          effect.type === 'paralyze'
      );

const confusionEffect =
  attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect) =>
          effect.type === 'confuse'
      );

const sleepEffect =
  attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect) =>
          effect.type === 'sleep'
      );

const extraDamageNextTurnEffect =
  attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect) =>
          effect.type ===
            'takeExtraDamageNextTurn'
      );
      // Le Pokémon survit
    newBoard[targetCell] = {
  ...target,
  currentHp: remainingHp,

 extraDamageNextTurn:
  extraDamageNextTurnEffect
    ? extraDamageNextTurnEffect.amount
    : target.extraDamageNextTurn,

extraDamageNextTurnSourcePlayer:
  extraDamageNextTurnEffect
    ? attacker.owner
    : target
        .extraDamageNextTurnSourcePlayer,

extraDamageNextTurnReady:
  extraDamageNextTurnEffect
    ? false
    : target.extraDamageNextTurnReady,

  // POISON
  poisoned: poisonEffect
    ? true
    : target.poisoned,

  poisonSourcePlayer: poisonEffect
    ? attacker.owner
    : target.poisonSourcePlayer,

  // BRÛLURE
  burned: burnEffect
    ? true
    : target.burned,

  burnSourcePlayer: burnEffect
    ? attacker.owner
    : target.burnSourcePlayer,

  burnTriggersRemaining: burnEffect
    ? 2
    : target.burnTriggersRemaining,

    paralyzed: paralysisEffect
  ? true
  : target.paralyzed,

paralysisTurnsRemaining: paralysisEffect
  ? 1
  : target.paralysisTurnsRemaining,

confused: confusionEffect
  ? true
  : target.confused,

confusionTurnsRemaining: confusionEffect
  ? 2
  : target.confusionTurnsRemaining,
};

const forceOpponentSwitchEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
      'forceOpponentActiveSwitch'
  );

const hasOpponentBenchPokemon =
  forceOpponentSwitchEffect
    ? Object.entries(newBoard).some(
        ([cellName, pokemon]) =>
          pokemon !== null &&
          pokemon.owner ===
            target.owner &&
          cellName !==
            targetCell
      )
    : false;

if (
  sleepEffect &&
  remainingHp > 0
) {
  setPendingSleepResolution({
    sourceCell:
      selectedPokemonCell,
    targetCell,
    sourcePlayer:
      attacker.owner,
  });

  startPokemonCoinFlip(
    selectedPokemonCell,
    1
  );
}

     const attackerKO = handleAttackerKO(
  newBoard,
  attackerAfterDrain,
  selectedPokemonCell
);

setBoard(newBoard);

setSelectedPokemonCell(null);
setSelectedAttackIndex(null);


// =====================================
// EFFET DE SCARHINO :
// L'ADVERSAIRE ÉCHANGE SON POKÉMON
// =====================================

if (
  forceOpponentSwitchEffect &&
  hasOpponentBenchPokemon &&
  !attackEffectsPrevented
) {
  setPendingOpponentActiveSwitch({
    player: target.owner,
    activeCell: targetCell,
  });

  setMessage(
    (
      damagePrevented
        ? `${target.card.name} ne subit aucun dégât grâce à son Talent ${target.card.talent?.name}.`
        : `${attacker.card.name} utilise ${attack.name} sur ${target.card.name} : ${damageToTarget} dégâts.`
    ) +
    (
      damagedBenchPokemonNames.length > 0
        ? ` Pokémon de banc touchés : ${damagedBenchPokemonNames.join(', ')}.`
        : ''
    ) +
    (
      attackerKO
        ? ` ${attacker.card.name} est également K.O.`
        : ''
    ) +
    ` Joueur ${target.owner}, choisis maintenant l’un de tes Pokémon de banc pour remplacer ${target.card.name}.`
  );

  return;
}


// =====================================
// PAS D'ÉCHANGE POSSIBLE
// =====================================

setMessage(
  (
    damagePrevented
      ? `${target.card.name} ne subit aucun dégât grâce à son Talent ${target.card.talent?.name}.`
      : `${attacker.card.name} utilise ${attack.name} sur ${target.card.name} : ${damageToTarget} dégâts.`
  ) +
  (
    damagedBenchPokemonNames.length > 0
      ? ` Pokémon de banc touchés : ${damagedBenchPokemonNames.join(', ')}.`
      : ''
  ) +
  (
    attackerKO
      ? ` ${attacker.card.name} est également K.O.`
      : ''
  )
);

return;

    }

    // --------------------------------
// AUCUN POKÉMON : ATTAQUE DIRECTE
// --------------------------------

// Comme aucun Pokémon n'est devant
// l'attaquant, tous les Pokémon adverses
// présents sur le plateau sont considérés
// comme des Pokémon de banc.
const directOpponentBenchCount =
  Object.values(board).filter(
    (pokemon) =>
      pokemon !== null &&
      pokemon.owner !== attacker.owner
  ).length;

const directOpponentBenchBonus =
  directOpponentBenchCount *
  (
    attack
      .bonusDamagePerOpponentBenchPokemon
      ?? 0
  );

const opponent: Player =
  attacker.owner === 1 ? 2 : 1;

const opponentStatus =
  opponent === 1
    ? player1Status
    : player2Status;

const delayedExtraDamageToPlayer =
  opponentStatus
    .extraDamageNextTurnReady &&
  opponentStatus
    .extraDamageNextTurnSourcePlayer ===
    attacker.owner
    ? opponentStatus
        .extraDamageNextTurn ?? 0
    : 0;

const directDamage =
  attack.fixedDamage !== undefined
    ? attack.fixedDamage
    : totalDamage +
      directOpponentBenchBonus;

// --------------------------------
// VOL DE VIE SUR LE JOUEUR ADVERSE
// --------------------------------

const hasDirectDrainEffect =
  resolvedAttack.effects?.some(
    (effect: AttackEffect) =>
      effect.type ===
      'healSelfByDamageDealt'
  ) ?? false;

if (
  hasDirectDrainEffect &&
  directDamage > 0
) {
  const currentAttacker =
    newBoard[
      selectedPokemonCell
    ];

  if (currentAttacker) {
    const attackerMaxHp =
      getPokemonMaxHp(
        currentAttacker
      );

    newBoard[
      selectedPokemonCell
    ] = {
      ...currentAttacker,

      currentHp:
        Math.min(
          attackerMaxHp,

          currentAttacker.currentHp +
            directDamage
        ),
    };
  }
}

if (attacker.owner === 1) {
  setPlayer2Damage(
    (damage) =>
      damage + directDamage
  );
} else {
  setPlayer1Damage(
    (damage) =>
      damage + directDamage
  );
}

if (
  startBenchOrPlayerDamageTarget(
    attacker,
    selectedPokemonCell,
    attack,
    null
  )
) {
  setMessage(
    `${attacker.card.name} inflige ${directDamage} dégâts au joueur ${opponent}. Choisis maintenant un Pokémon de banc adverse ou le joueur adverse pour les 30 dégâts supplémentaires.`
  );

  return;
}

applyAttackStatusToPlayer(
  opponent,
  attack,
  attacker.owner
);

    const attackerAfterDirectDrain =
  newBoard[
    selectedPokemonCell
  ] ?? attackerAfterEffect;

const attackerKO =
  handleAttackerKO(
    newBoard,
    attackerAfterDirectDrain,
    selectedPokemonCell
  );

    setBoard(newBoard);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    

    setMessage(
      `${attacker.card.name} attaque directement le joueur ${opponent} avec ${attack.name} : +${directDamage} dégâts !`
    );
  }

  function endTurn(
  boardOverride?: BoardState
) {
    if (gameOver) return;

    /*
      À la fin du tour :
      les Pokémon adverses gagnent +1 Énergie.
    */
    const playerReceivingEnergy: Player =
      currentPlayer === 1 ? 2 : 1;

    const newBoard: BoardState = {
  ...(boardOverride ?? board),
};

const koPlayer1: PokemonInPlay[] = [];
const koPlayer2: PokemonInPlay[] = [];

Object.keys(newBoard).forEach((cellName) => {
  let pokemon = newBoard[cellName];

  if (!pokemon) {
    return;
  }

  // -----------------------------
  // ÉNERGIE
  // -----------------------------

 if (
  pokemon.owner === playerReceivingEnergy
) {
  const passiveEnergyLimit =
    getPassiveEnergyLimit(
      pokemon.card
    );

  const canReceivePassiveEnergy =
    pokemon.energies.length <
    passiveEnergyLimit;

  pokemon = {
    ...pokemon,

    energies:
      canReceivePassiveEnergy
        ? [
            ...pokemon.energies,
            pokemon.card.type,
          ]
        : pokemon.energies,

    hasAttacked: false,
  };
}

  // -----------------------------
  // POISON
  // -----------------------------

  if (
    pokemon.poisoned &&
    pokemon.poisonSourcePlayer === currentPlayer
  ) {
    pokemon = {
      ...pokemon,
      currentHp: pokemon.currentHp - 10,
    };
  }

  // -----------------------------
  // BRÛLURE
  // -----------------------------

  if (
    pokemon.burned &&
    pokemon.burnSourcePlayer === currentPlayer &&
    pokemon.burnTriggersRemaining > 0
  ) {
    const newRemaining =
      pokemon.burnTriggersRemaining - 1;

    pokemon = {
      ...pokemon,

      currentHp:
        pokemon.currentHp - 20,

      burnTriggersRemaining:
        newRemaining,

      burned:
        newRemaining > 0,

      burnSourcePlayer:
        newRemaining === 0
          ? null
          : pokemon.burnSourcePlayer,
    };
  }

  // -----------------------------
// PARALYSIE
// -----------------------------

if (
  pokemon.owner === currentPlayer &&
  pokemon.paralyzed &&
  pokemon.paralysisTurnsRemaining > 0
) {
  const remaining =
    pokemon.paralysisTurnsRemaining - 1;

  pokemon = {
    ...pokemon,

    paralysisTurnsRemaining:
      remaining,

    paralyzed:
      remaining > 0,
  };
}
// -----------------------------
// CONFUSION
// -----------------------------

if (
  pokemon.owner === currentPlayer &&
  pokemon.confused &&
  pokemon.confusionTurnsRemaining > 0
) {
  const remaining =
    pokemon.confusionTurnsRemaining - 1;

  pokemon = {
    ...pokemon,

    confusionTurnsRemaining:
      remaining,

    confused:
      remaining > 0,
  };
}

// -----------------------------
// SOMMEIL
// -----------------------------

if (
  pokemon.asleep &&
  pokemon.sleepEndPlayer ===
    currentPlayer
) {
  pokemon = {
    ...pokemon,

    asleep: false,
    sleepSourcePlayer: null,
    sleepEndPlayer: null,
  };
}

// --------------------------------
// +60 AU PROCHAIN TOUR
// --------------------------------

if (
  pokemon
    .extraDamageNextTurnSourcePlayer ===
  currentPlayer
) {
  // L'effet vient d'être posé :
  // il devient actif pour le prochain tour
  if (
    !pokemon.extraDamageNextTurnReady
  ) {
    pokemon = {
      ...pokemon,

      extraDamageNextTurnReady:
        true,
    };
  }

  // Il était déjà actif :
  // le prochain tour vient de se terminer,
  // donc l'effet disparaît.
  else {
    pokemon = {
      ...pokemon,

      extraDamageNextTurn: 0,

      extraDamageNextTurnSourcePlayer:
        null,

      extraDamageNextTurnReady:
        false,
    };
  }
}

// -----------------------------
// FIN DE LA RÉDUCTION DE DÉGÂTS
// -----------------------------

if (
  pokemon.attackDamageReductionEndPlayer ===
  currentPlayer
) {
  pokemon = {
    ...pokemon,

    attackDamageReduction: 0,

    attackDamageReductionEndPlayer:
      null,
  };
}

  // -----------------------------
  // K.O. À CAUSE D'UN ÉTAT
  // -----------------------------

  if (pokemon.currentHp <= 0) {
    newBoard[cellName] = null;

    prepareKOEnergyMove(
  pokemon,
  newBoard
);

    if (pokemon.owner === 1) {
      koPlayer1.push(pokemon);
    } else {
      koPlayer2.push(pokemon);
    }

    return;
  }

  // Pokémon toujours vivant
  newBoard[cellName] = pokemon;
});

setBoard(newBoard);

// --------------------------------
// ÉTATS SPÉCIAUX DU JOUEUR 1
// --------------------------------

if (
  player1Status.poisoned &&
  player1Status.poisonSourcePlayer === currentPlayer
) {
  setPlayer1Damage(
    (damage) => damage + 10
  );
}

// --------------------------------
// ÉTATS SPÉCIAUX DU JOUEUR 2
// --------------------------------

if (
  player2Status.poisoned &&
  player2Status.poisonSourcePlayer === currentPlayer
) {
  setPlayer2Damage(
    (damage) => damage + 10
  );
}

if (
  player1Status.burned &&
  player1Status.burnSourcePlayer === currentPlayer &&
  player1Status.burnTriggersRemaining > 0
) {
  setPlayer1Damage(
    (damage) => damage + 20
  );

  setPlayer1Status((status) => {
    const remaining =
      status.burnTriggersRemaining - 1;

    return {
      ...status,

      burned:
        remaining > 0,

      burnSourcePlayer:
        remaining === 0
          ? null
          : status.burnSourcePlayer,

      burnTriggersRemaining:
        remaining,
    };
  });
}

if (
  player2Status.burned &&
  player2Status.burnSourcePlayer === currentPlayer &&
  player2Status.burnTriggersRemaining > 0
) {
  setPlayer2Damage(
    (damage) => damage + 20
  );

  setPlayer2Status((status) => {
    const remaining =
      status.burnTriggersRemaining - 1;

    return {
      ...status,

      burned:
        remaining > 0,

      burnSourcePlayer:
        remaining === 0
          ? null
          : status.burnSourcePlayer,

      burnTriggersRemaining:
        remaining,
    };
  });
}

if (koPlayer1.length > 0) {
  const totalPenalty =
    koPlayer1.reduce(
      (total, pokemon) =>
        total +
        getKOPenalty(pokemon.card.stage,pokemon.card.variant),
      0
    );

  setPlayer1Damage(
    (damage) =>
      damage + totalPenalty
  );

  setPlayer1Discard(
  (discard) => [
    ...discard,

    ...koPlayer1.flatMap(
      (pokemon) => [
        pokemon.card,

        ...(pokemon.attachedTool
          ? [pokemon.attachedTool]
          : []),
      ]
    ),
  ]
);

  setPlayer1DiscardEnergies(
    (discard) => [
      ...discard,
      ...koPlayer1.flatMap(
        (pokemon) => pokemon.energies
      ),
    ]
  );
}

if (koPlayer2.length > 0) {
  const totalPenalty =
    koPlayer2.reduce(
      (total, pokemon) =>
        total +
        getKOPenalty(
          pokemon.card.stage,
          pokemon.card.variant
        ),
      0
    );

  setPlayer2Damage(
    (damage) =>
      damage + totalPenalty
  );

  setPlayer2Discard(
    (discard) => [
      ...discard,

      ...koPlayer2.flatMap(
        (pokemon) => [
          pokemon.card,

          ...(pokemon.attachedTool
            ? [pokemon.attachedTool]
            : []),
        ]
      ),
    ]
  );

  setPlayer2DiscardEnergies(
    (discard) => [
      ...discard,

      ...koPlayer2.flatMap(
        (pokemon) =>
          pokemon.energies
      ),
    ]
  );
}

// =================================
// +60 AU PROCHAIN TOUR DU JOUEUR
// =================================

function advancePlayerExtraDamage(
  previousStatus: PlayerStatusState
): PlayerStatusState {
  if (
    previousStatus
      .extraDamageNextTurnSourcePlayer !==
    currentPlayer
  ) {
    return previousStatus;
  }

  // L'effet vient juste d'être posé.
// Il devient actif pour le prochain
// tour du joueur qui l'a posé.
  if (
    !previousStatus
      .extraDamageNextTurnReady
  ) {
    return {
      ...previousStatus,

      extraDamageNextTurnReady:
        true,
    };
  }

  // Le prochain tour du joueur
  // vient de se terminer :
  // l'effet disparaît.
  return {
    ...previousStatus,

    extraDamageNextTurn: 0,

    extraDamageNextTurnSourcePlayer:
      null,

    extraDamageNextTurnReady:
      false,
  };
}

setPlayer1Status(
  advancePlayerExtraDamage
);

setPlayer2Status(
  advancePlayerExtraDamage
);

    setSelectedCard(null);
    setSelectedPokemonCell(null);
    setSelectedTrainerCard(null);
    setTrainerEffectActivated(false);
    setHasPlacedThisTurn(false);
    setHasUsedSupporterThisTurn(false);
    setSelectedAttackIndex(null);
    setHasAttackedThisTurn(false);
    setRemainingAttackPaths([]);

    if (currentPlayer === 1) {
      setTurnId(
  (previous) =>
    previous + 1
);
      setCurrentPlayer(2);

      setMessage(
        `Tour du joueur 2 — Manche ${round}/8`
      );

      return;
    }

    // FIN DU TOUR 8 DU JOUEUR 2
    if (round === 8) {
      setGameOver(true);

      if (player1Damage < player2Damage) {
        setMessage(
          `🏆 Joueur 1 gagne : ${player1Damage} dégâts contre ${player2Damage}.`
        );
      } else if (
        player2Damage < player1Damage
      ) {
        setMessage(
          `🏆 Joueur 2 gagne : ${player2Damage} dégâts contre ${player1Damage}.`
        );
      } else {
        setMessage(
          `Égalité : ${player1Damage} dégâts chacun.`
        );
      }

      return;
    }

    const nextRound = round + 1;

setTurnId(
  (previous) =>
    previous + 1
);

    setRound(nextRound);
    setCurrentPlayer(1);

    setMessage(
      `Manche ${nextRound}/8 — Tour du joueur 1`
    );
  }
function restartGame() {
  setPlayer1Status(
  createNormalPlayerStatus()
);

setOpenedDiscardPlayer(
  null
);

setPendingInvocationPlacement(
  null
);

setSelectedTrainerOwner(
  null
);

setPlayer1InvocationCards(
  []
);

setPlayer2InvocationCards(
  []
);

setInvocationSetupPlayer(
  null
);

setPendingAttackAfterCoin(null);
setReadyCoinAttack(null);

setPendingCoinReturnToHand(null);

setTurnId(1);

setPendingKOSurvival(null);

setPendingGeneratedBenchEnergy(
  null
);

setPendingOpponentActiveSwitch(null);

setPendingKOEnergyMove(null);

setTrainerEffectActivated(false);

setPendingBothPlayersSwitch(null);

setPokemonPlacementLocks({});

setSelectedAttachedTool(null);

setPendingOpponentTarget(null);

setPendingCoinFlip(null);
setCoinDraft([]);

setPendingPokemonSwitch(null);

setPlayer2Status(
  createNormalPlayerStatus()
);
  setPlayer1Discard([]);
setPlayer2Discard([]);
  setBoard(createEmptyBoard());

  setCurrentPlayer(1);
  setRound(1);

  setSelectedCard(null);
  setSelectedPokemonCell(null);
  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedAttackIndex(null);

  setPendingSleepResolution(null);

  setHasPlacedThisTurn(false);
  setHasUsedSupporterThisTurn(false);

  setPlayer1DiscardEnergies([]);
  setPlayer2DiscardEnergies([]);

  setPlayer1CoinConstraints({});
  setPlayer2CoinConstraints({});
  setTrainerCoinHistories({});

  setHasAttackedThisTurn(false);

  setRemainingAttackPaths([]);

  setPendingBenchEnergyAttachment(null);

setPlayer1Hand([]);
setPlayer2Hand([]);

setPlayer1SetupCards([]);
setPlayer2SetupCards([]);

setSetupPhase(
  'player1'
);

  setPlayer1Damage(0);
  setPlayer2Damage(0);

  setGameOver(false);

  setMessage(
  'Joueur 1 : choisis 8 Pokémon, 3 Objets et 2 Supporters.'
);
}

function restartSameCards() {
  setPlayer1Status(
  createNormalPlayerStatus()
);

setPendingInvocationPlacement(
  null
);

setOpenedDiscardPlayer(
  null
);

setSelectedTrainerOwner(
  null
);

setInvocationSetupPlayer(
  null
);

setPendingAttackAfterCoin(null);
setReadyCoinAttack(null);

setPendingCoinReturnToHand(null);

setTurnId(1);

setPendingKOSurvival(null);

setPendingGeneratedBenchEnergy(
  null
);

setPendingOpponentActiveSwitch(null);

setPendingKOEnergyMove(null);

setTrainerEffectActivated(false);

setPendingBothPlayersSwitch(null);

setPokemonPlacementLocks({});

setSelectedAttachedTool(null);

setPendingOpponentTarget(null);

setPendingCoinFlip(null);
setCoinDraft([]);

setPendingPokemonSwitch(null);

setPlayer2Status(
  createNormalPlayerStatus()
);
  setPlayer1Discard([]);
setPlayer2Discard([]);
  setBoard(createEmptyBoard());

  setCurrentPlayer(1);
  setRound(1);

  setSelectedCard(null);
  setSelectedPokemonCell(null);
  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedAttackIndex(null);

  setPendingSleepResolution(null);

  setHasPlacedThisTurn(false);
  setHasUsedSupporterThisTurn(false);

  setPlayer1DiscardEnergies([]);
  setPlayer2DiscardEnergies([]);

  setPlayer1CoinConstraints({});
  setPlayer2CoinConstraints({});
  setTrainerCoinHistories({});

  setHasAttackedThisTurn(false);

  setRemainingAttackPaths([]);

  setPendingBenchEnergyAttachment(null);

setPlayer1Hand([
  ...player1SetupCards,
]);

setPlayer2Hand([
  ...player2SetupCards,
]);

setSetupPhase(
  'battle'
);

  setPlayer1Damage(0);
  setPlayer2Damage(0);

  setGameOver(false);

  setMessage(
  'Nouvelle partie avec les mêmes cartes ! Tour du joueur 1.'
);
}

function getDisplayedAttackDamage(
  pokemon: PokemonInPlay,
  attack: Attack,
  coinResult?: CoinSide[]
): number {
  // Dégâts fixes :
  // ils ne doivent pas recevoir de bonus
  if (attack.fixedDamage !== undefined) {
    return attack.fixedDamage;
  }

  let damage =
  coinResult
    ? calculateCoinDamage(
        attack,
        coinResult
      )
    : attack.damage;

  // --------------------------------
  // SARMURAÏ :
  // + dégâts si échange récent
  // --------------------------------

  const switchedRecently =
    pokemon.lastSwitchedTurnId !==
      undefined &&
    (
      pokemon.lastSwitchedTurnId ===
        turnId ||
      pokemon.lastSwitchedTurnId ===
        turnId - 1
    );

  if (switchedRecently) {
    damage +=
      attack
        .bonusDamageIfSwitchedRecently
      ?? 0;
  }

  // --------------------------------
  // MALAMANDRE :
  // + dégâts tous les 2 tours
  // --------------------------------

  damage +=
    Math.floor(round / 2) *
    (
      attack
        .bonusDamageEveryTwoRounds
      ?? 0
    );

  // --------------------------------
  // NECROZMA :
  // bonus selon les Énergies
  // actuellement attachées
  // --------------------------------

  const discardAllBonus =
    attack.effects?.find(
      (effect) =>
        effect.type ===
          'discardAllTypedEnergyForBonus' &&
        effect.energyType
    );

  if (
    discardAllBonus &&
    discardAllBonus.energyType
  ) {
    const matchingEnergyCount =
      pokemon.energies.filter(
        (energy) =>
          energy ===
          discardAllBonus.energyType
      ).length;

    damage +=
      matchingEnergyCount *
      discardAllBonus.amount;
  }
// --------------------------------
// CIBLE ACTUELLE DEVANT LE POKÉMON
// --------------------------------

if (selectedPokemonCell) {
  const column =
    selectedPokemonCell.substring(1);

  const targetCells =
    pokemon.owner === 1
      ? [
          `C${column}`,
          `D${column}`,
        ]
      : [
          `B${column}`,
          `A${column}`,
        ];

  const targetCell =
    targetCells.find(
      (cell) =>
        board[cell] !== null
    );

  const target =
    targetCell
      ? board[targetCell]
      : null;

  // --------------------------------
  // NOCTUNOIR :
  // + dégâts par Pokémon de banc adverse
  // --------------------------------

  const opponentBenchCount =
    Object.entries(board).filter(
      ([cellName, boardPokemon]) =>
        boardPokemon !== null &&
        boardPokemon.owner !==
          pokemon.owner &&
        (
          targetCell
            ? cellName !== targetCell
            : true
        )
    ).length;

  damage +=
    opponentBenchCount *
    (
      attack
        .bonusDamagePerOpponentBenchPokemon
      ?? 0
    );

  // --------------------------------
  // MACKOGNEUR :
  // + dégâts si la cible est évoluée
  // --------------------------------

  if (
    target &&
    attack.bonusDamageIfTargetEvolved &&
    target.card.stage !== 'base'
  ) {
    damage +=
      attack.bonusDamageIfTargetEvolved;
  }
}
  return damage;
}

  const selectedPokemon =
    selectedPokemonCell
      ? board[selectedPokemonCell]
      : null;

const openedDiscardCards =
  openedDiscardPlayer === 1
    ? player1Discard
    : openedDiscardPlayer === 2
      ? player2Discard
      : [];
      if (invocationSetupPlayer) {
  const invocationCards =
    invocationSetupPlayer === 1
      ? player1InvocationCards
      : player2InvocationCards;

  const invocationCandidates =
    ALL_POKEMON_CARDS.filter(
      (card) =>
        card.stage === 'base' &&
        card.maxHp <= 60
    );

  const openedDiscardCards =
  openedDiscardPlayer === 1
    ? player1Discard
    : openedDiscardPlayer === 2
      ? player2Discard
      : [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Choix des Invocations
      </Text>

      <Text style={styles.handTitle}>
        Joueur {
          invocationSetupPlayer
        }
      </Text>

      <Text style={styles.actionInfo}>
        Choisis 2 Pokémon de Base
        ayant 60 PV ou moins.
      </Text>

      <Text style={styles.actionInfo}>
        {
          invocationCards.length
        }/2 sélectionnés
      </Text>

      <Text style={styles.actionInfo}>
        Tu peux choisir deux fois
        le même Pokémon.
      </Text>

      <View
        style={
          styles.setupPokemonRows
        }
      >
        {Array.from({
          length: Math.ceil(
            invocationCandidates.length /
              setupPokemonPerRow
          ),
        }).map((_, rowIndex) => {
          const rowCards =
            invocationCandidates.slice(
              rowIndex *
                setupPokemonPerRow,

              rowIndex *
                setupPokemonPerRow +
                setupPokemonPerRow
            );

          return (
            <View
              key={
                `invocation-row-${rowIndex}`
              }
              style={
                styles.setupPokemonRow
              }
            >
              {rowCards.map(
                (card) => {
                  const count =
                    invocationCards.filter(
                      (selected) =>
                        selected.id ===
                        card.id
                    ).length;

                  return (
                    <View
                      key={card.id}
                      style={[
                        styles
                          .setupPokemonCell,
                        {
                          
  width:
    `${100 / setupPokemonPerRow}%` as `${number}%`,

                        },
                      ]}
                    >
                      <Pressable
                        onPress={() =>
                          addInvocationSetupCard(
                            card
                          )
                        }
                        style={
                          styles
                            .handPokemonPressable
                        }
                      >
                        <PokemonHandCard
                          card={card}
                        />
                      </Pressable>

                      {count > 0 && (
                        <Text
                          style={
                            styles.actionInfo
                          }
                        >
                          Choisi x
                          {count}
                        </Text>
                      )}
                    </View>
                  );
                }
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.handTitle}>
        Tes 2 Invocations
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {invocationCards.map(
          (card, index) => (
            <Pressable
              key={
                `${card.id}-${index}`
              }
              onPress={() =>
                removeInvocationSetupCard(
                  index
                )
              }
              style={
                styles
                  .handPokemonPressable
              }
            >
              <PokemonHandCard
                card={card}
              />
            </Pressable>
          )
        )}
      </View>

      <Pressable
        style={styles.attackButton}
        onPress={() => {
          if (
            invocationCards.length !==
            2
          ) {
            setMessage(
              'Choisis exactement 2 Invocations.'
            );

            return;
          }

          if (
            invocationSetupPlayer ===
            1
          ) {
            setInvocationSetupPlayer(
              null
            );

            setSetupPhase(
              'player2'
            );

            setMessage(
              'Joueur 2 : choisis 8 Pokémon, 3 Objets et 2 Supporters.'
            );

            return;
          }

          setInvocationSetupPlayer(
            null
          );

          setSetupPhase(
            'battle'
          );

          setCurrentPlayer(1);

          setMessage(
            'Tour du joueur 1 — Manche 1/8'
          );
        }}
      >
        <Text
          style={
            styles.attackButtonText
          }
        >
          VALIDER LES 2 INVOCATIONS
        </Text>
      </Pressable>

      <View style={styles.messageBox}>
        <Text style={styles.message}>
          {message}
        </Text>
      </View>
    </ScrollView>
  );
}
    if (
  setupPhase !== 'battle'
) {
  const setupPlayer: Player =
    setupPhase === 'player1'
      ? 1
      : 2;

  const setupCards =
    setupPhase === 'player1'
      ? player1SetupCards
      : player2SetupCards;

  const {
    pokemonCount,
    objectCount,
    supporterCount,
  } =
    getSetupCounts(
      setupCards
    );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Pokémon Plateau
      </Text>

      <View style={styles.actionBox}>
        <Text
          style={
            styles.actionTitle
          }
        >
          Composition de la main
          du joueur {setupPlayer}
        </Text>

        <Text
          style={
            styles.actionInfo
          }
        >
          Pokémon :
          {' '}
          {pokemonCount}/8
        </Text>

        <Text
          style={
            styles.actionInfo
          }
        >
          Objets :
          {' '}
          {objectCount}/3
        </Text>

        <Text
          style={
            styles.actionInfo
          }
        >
          Supporters :
          {' '}
          {supporterCount}/2
        </Text>
      </View>


      {/* ======================== */}
      {/* POKÉMON                 */}
      {/* ======================== */}

      <Text
        style={
          styles.handTitle
        }
      >
        Choisis 8 Pokémon
      </Text>

     <View style={styles.setupPokemonRows}>
  {Array.from({
    length: Math.ceil(
  ALL_POKEMON_CARDS.length /
    setupPokemonPerRow
),
  }).map((_, rowIndex) => {
    const rowCards =
  ALL_POKEMON_CARDS.slice(
    rowIndex *
      setupPokemonPerRow,

    rowIndex *
      setupPokemonPerRow +
      setupPokemonPerRow
  );

    return (
      <View
        key={`pokemon-row-${rowIndex}`}
        style={styles.setupPokemonRow}
      >
        {rowCards.map((card) => {
          const selected =
            setupCards.some(
              (selectedCard) =>
                selectedCard.id ===
                card.id
            );

          return (
            <View
  key={card.id}
  style={[
    styles.setupPokemonCell,

    {
      width:
        `${100 / setupPokemonPerRow}%` as `${number}%`,
    },
  ]}
>
  <View
    style={[
      styles.setupPokemonSelectionBorder,

      selected
        ? styles.setupPokemonSelected
        : styles.setupPokemonNotSelected,
    ]}
  >
    <Pressable
      onPress={() =>
        toggleSetupCard(card)
      }
      style={
        styles.handPokemonPressable
      }
    >
      <PokemonHandCard
        card={card}
      />
    </Pressable>
  </View>
</View>
          );
        })}
      </View>
    );
  })}
</View>


      {/* ======================== */}
      {/* OBJETS                  */}
      {/* ======================== */}

      <Text
        style={
          styles.handTitle
        }
      >
        Choisis 3 Objets
      </Text>

      <View style={styles.setupGrid}>
  {ALL_TRAINER_CARDS
    .filter(
      (card) =>
        card.category ===
        'objet'
    )
    .map((card) => {
      const selected =
        setupCards.some(
          (selectedCard) =>
            selectedCard.id ===
            card.id
        );

      return (
        <View
 key={card.id}
  style={[
    styles.setupGridCell,

    isTablet && {
      width: '20%',
      paddingHorizontal: 6,
    },
  ]}
>
  <View
    style={[
      styles.setupTrainerWrapper,

      selected &&
        styles.setupTrainerSelected,
    ]}
  >
    <TrainerHandCard
      card={card}
      disabled={false}
      isSelected={selected}
      onPress={() =>
        toggleSetupCard(card)
      }
    />
  </View>
</View>
      );
    })}
</View>


      {/* ======================== */}
      {/* SUPPORTERS              */}
      {/* ======================== */}

      <Text
        style={
          styles.handTitle
        }
      >
        Choisis 2 Supporters
      </Text>

      <View style={styles.setupGrid}>
  {ALL_TRAINER_CARDS
    .filter(
      (card) =>
        card.category ===
        'supporter'
    )
    .map((card) => {
      const selected =
        setupCards.some(
          (selectedCard) =>
            selectedCard.id ===
            card.id
        );

      return (
       <View
  key={card.id}
  style={[
    styles.setupGridCell,

    isTablet && {
      width: '20%',
      paddingHorizontal: 6,
    },
  ]}
>
  <View
    style={[
      styles.setupTrainerWrapper,

      selected &&
        styles.setupTrainerSelected,
    ]}
  >
    <TrainerHandCard
      card={card}
      disabled={false}
      isSelected={selected}
      onPress={() =>
        toggleSetupCard(card)
      }
    />
  </View>
</View>
      );
    })}
</View>


      <Pressable
        onPress={
          confirmSetupSelection
        }

        style={
          styles.attackButton
        }
      >
        <Text
          style={
            styles.attackButtonText
          }
        >
          {setupPhase ===
          'player1'
            ? 'VALIDER LA MAIN DU JOUEUR 1'
            : 'VALIDER ET COMMENCER LA PARTIE'}
        </Text>
      </Pressable>


      <View
        style={
          styles.messageBox
        }
      >
        <Text
          style={
            styles.message
          }
        >
          {message}
        </Text>
      </View>
    </ScrollView>
  );
}

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Pokémon Plateau
      </Text>

      <Text style={styles.round}>
        Manche {round} / 8
      </Text>

      <View style={styles.turnBox}>
        <Text style={styles.turnText}>
          {gameOver
            ? '🏁 FIN DE LA PARTIE'
            : `▶ Tour du joueur ${currentPlayer}`}
        </Text>
      </View>

      {/* JOUEUR 1 */}

      <Text style={styles.info}>
        Pose : B1 à B4 • Retraite : B → A
      </Text>

      <View style={styles.playerHandRow}>

  <PlayerTargetCard
    player={1}
    damage={player1Damage}
    status={player1Status}
    onPress={() =>
      handlePlayerTargetPress(1)
    }
    selectable={
      canSelectPlayerTarget(1)
    }
  />

  <View style={styles.playerHandContent}>

      <Text style={styles.handTitle}>
        Main du joueur 1
      </Text>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={true}
  contentContainerStyle={styles.hand}
  style={styles.handScroll}
>
  
  {player1Hand.length > 0 ? (
  player1Hand.map((card) =>
    isPokemonCard(card) ? (

      // POKÉMON
      <View
  key={`j1-${card.id}`}
  style={[
    styles.handPokemonSelectionBorder,

    currentPlayer === 1 &&
    selectedCard?.id === card.id
      ? styles.handPokemonSelected
      : styles.handPokemonNotSelected,
  ]}
>
  <Pressable
    onPress={() =>
      handleHandCardPress(
        card,
        1
      )
    }
    style={[
      styles.handPokemonPressable,

      currentPlayer !== 1 &&
        styles.disabledCard,
    ]}
  >
    <PokemonHandCard
      card={card}
    />
  </Pressable>
</View>

    ) : (

      // DRESSEUR
      <TrainerHandCard
        key={`j1-${card.id}`}
        card={card}
        disabled={
  currentPlayer !== 1 &&
  card.effect !==
    'summonTwoBase60'
}
        isSelected={
  selectedTrainerOwner === 1 &&
  selectedTrainerCard?.id ===
    card.id
}
        onPress={() =>
          handleHandCardPress(
            card,
            1
          )
        }
      />

    )
  )
) : (
  <Text style={styles.emptyHand}>
    Aucune carte
  </Text>
)}

</ScrollView>

  </View>
</View>

<Pressable
  style={styles.discardBox}
  onPress={() => {
    setOpenedDiscardPlayer(
      (previous) =>
        previous === 1
          ? null
          : 1
    );
  }}
>
  <Text style={styles.discardTitle}>
    🗑️ Défausse J1 :{' '}
{player1Discard.length +
  player1DiscardEnergies.length}
  </Text>

  {player1Discard.map((card, index) => (
    <Text
      key={`${card.id}-${index}`}
      style={styles.discardCard}
    >
      {card.name}
    </Text>
  ))}

{player1DiscardEnergies.map((energy, index) => (
  <Text
    key={`energy-j1-${index}`}
    style={styles.discardCard}
  >
    {getTypeIcon(energy)} Énergie
  </Text>
))}

</Pressable>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={true}

  scrollEnabled={
    openedDiscardPlayer === null
  }

  style={
    styles.battleAreaScroll
  }

  contentContainerStyle={
    styles.battleAreaScrollContent
  }
>
  <View style={styles.battleAreaRow}>

{/* PLATEAU */}

<View style={styles.boardWrapper}>
  <ImageBackground
    source={require('../../assets/images/plateau-pokemon.png')}
    style={styles.boardBackground}
    resizeMode="stretch"
  >
    {rows.map((row) =>
      columns.map((column) => {
        const cellName =
          `${row}${column}`;

        const pokemon =
          board[cellName];

        const isSelected =
          selectedPokemonCell ===
          cellName;

        const hpPercent = pokemon
  ? Math.max(
      0,
      Math.min(
        100,
        (pokemon.currentHp /
          pokemon.card.maxHp) *
          100
      )
    )
  : 0;

const hpWidth =
  `${hpPercent}%` as `${number}%`;

        return (
          <Pressable
            key={cellName}
            onPress={() =>
              handleCellPress(cellName)
            }
            style={[
              styles.boardImageCell,

              {
                top:
                  boardRowPositions[row],

                left:
                  boardColumnPositions[
                    String(column)
                  ],
              },

              isSelected &&
                styles.selectedImageCell,
            ]}
          >
            {!pokemon && (
  <Text style={styles.imageCellLabel}>
    {cellName}
  </Text>
)}

{pokemon && (
  <PokemonBoardCard
    pokemon={pokemon}
    onToolPress={() => {
      const tool =
        pokemon.attachedTool;

      if (!tool) {
        return;
      }

      // Si on rappuie sur le même
      // outil : on ferme son affichage
      if (
        selectedAttachedTool
          ?.cellName === cellName
      ) {
        setSelectedAttachedTool(
          null
        );

        return;
      }

      // Sinon on affiche cet outil
      setSelectedAttachedTool({
        card: tool,
        cellName,
      });

      // On masque l'ancien panneau
      // Pokémon pour laisser la place
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);
    }}
  />
)}
          </Pressable>
        );
      })
    )}
  </ImageBackground>
  
</View>

<View style={styles.rightBattlePanel}>

{openedDiscardPlayer && (
  <View
    style={
      styles.discardPreviewOverlay
    }
  >
    <View
      style={
        styles.discardPreviewHeader
      }
    >
      <Text
        style={
          styles.discardPreviewTitle
        }
      >
        🗑️ Défausse J
        {openedDiscardPlayer}
      </Text>

      <Pressable
        onPress={() =>
          setOpenedDiscardPlayer(
            null
          )
        }
      >
        <Text
          style={
            styles.discardPreviewClose
          }
        >
          ✕
        </Text>
      </Pressable>
    </View>

    {openedDiscardCards.length ===
    0 ? (
      <Text
        style={
          styles.discardPreviewEmpty
        }
      >
        Aucune carte
      </Text>
    ) : (
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
        style={
          styles.discardPreviewScroll
        }
      >
        <View
          style={
            styles.discardPreviewColumns
          }
        >
          {Array.from({
            length: Math.ceil(
              openedDiscardCards.length /
                2
            ),
          }).map(
            (_, columnIndex) => {
              const firstCard =
                openedDiscardCards[
                  columnIndex * 2
                ];

              const secondCard =
                openedDiscardCards[
                  columnIndex * 2 + 1
                ];

              return (
                <View
                  key={
                    `discard-column-${columnIndex}`
                  }
                  style={
                    styles
                      .discardPreviewColumn
                  }
                >
                  {[
                    firstCard,
                    secondCard,
                  ].map(
                    (
                      card,
                      rowIndex
                    ) =>
                      card ? (
                        <View
  key={
    `${card.id}-${columnIndex}-${rowIndex}`
  }
  style={
    styles.discardPreviewCard
  }
>
  {isPokemonCard(card) ? (
    <View
      style={
        styles.discardPreviewPokemonSize
      }
    >
      <PokemonHandCard
        card={card}
      />
    </View>
  ) : (
    <TrainerHandCard
      card={card}
      disabled={false}
      isSelected={false}
      onPress={() => {}}
    />
  )}
</View>
                      ) : null
                  )}
                </View>
              );
            }
          )}
        </View>
      </ScrollView>
    )}
  </View>
)}

  {selectedAttachedTool && (
  <View
    style={styles.attachedToolPreview}
  >
    <Text
      style={
        styles.attachedToolPreviewTitle
      }
    >
      Outil attaché
    </Text>

    <TrainerHandCard
      card={
        selectedAttachedTool.card
      }
      disabled={false}
      isSelected={false}
      onPress={() => {}}
    />
  </View>
)}

{pendingKOEnergyMove && (
  <View style={styles.actionBox}>

    <Text style={styles.actionTitle}>
      Relais d’Énergie
    </Text>

    <Text style={styles.actionInfo}>
      {pendingKOEnergyMove
        .sourcePokemonName} est K.O.
    </Text>

    <Text style={styles.actionInfo}>
      Choisis l’Énergie à déplacer :
    </Text>

    {Array.from(
      new Set(
        pendingKOEnergyMove
          .availableEnergies
      )
    ).map((energy) => (

      <Button
        key={energy}

        title={
          pendingKOEnergyMove
            .selectedEnergy ===
          energy
            ? `✅ ${getTypeIcon(
                energy
              )} ${energy}`
            : `${getTypeIcon(
                energy
              )} ${energy}`
        }

        onPress={() =>
          setPendingKOEnergyMove(
            (previous) =>
              previous
                ? {
                    ...previous,

                    selectedEnergy:
                      energy,
                  }
                : null
          )
        }
      />

    ))}

    {pendingKOEnergyMove
      .selectedEnergy && (
      <Text style={styles.actionInfo}>
        Maintenant, clique sur l’un de tes Pokémon pour lui attacher cette Énergie.
      </Text>
    )}

  </View>
)}

{pendingInvocationPlacement && (
  <View style={styles.actionBox}>

    <Text
      style={styles.actionTitle}
    >
      ✨ Invocation Duo
    </Text>

    <Text
      style={styles.actionInfo}
    >
      Choisis une Invocation,
      puis clique sur une case vide
      de ta ligne.
    </Text>

    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {pendingInvocationPlacement
        .cards.map(
          (card, index) => (
            <Pressable
              key={
                `pending-invocation-${card.id}-${index}`
              }
              onPress={() =>
                setPendingInvocationPlacement(
                  (previous) =>
                    previous
                      ? {
                          ...previous,

                          selectedIndex:
                            index,
                        }
                      : null
                )
              }
              style={
                styles
                  .handPokemonPressable
              }
            >
              <PokemonHandCard
                card={card}
              />

              <Text
                style={
                  styles.actionInfo
                }
              >
                {pendingInvocationPlacement
                  .selectedIndex ===
                index
                  ? '✅ À poser'
                  : 'Choisir'}
              </Text>
            </Pressable>
          )
        )}
    </View>

  </View>
)}

   {/* ACTION DU POKÉMON */}
   {selectedPokemon &&
        selectedPokemonCell && (
          <View style={styles.actionBox}>
            <Text style={styles.actionTitle}>
              {getTypeIcon(
                selectedPokemon.card.type
              )}{' '}
              {selectedPokemon.card.name}
            </Text>

           

            <Text style={styles.actionInfo}>
              Case :{' '}
              {selectedPokemonCell}
            </Text>

            <Text style={styles.actionInfo}>
              Énergies :{' '}
              {formatEnergies(selectedPokemon.energies)}
            </Text>

           <Text style={styles.attackTitle}>
           {selectedPokemon.card.talent && (
  <View>
    <Text style={styles.attackTitle}>
      ✨ Talent :{' '}
      {selectedPokemon.card.talent.name}
    </Text>

    <Text style={styles.actionInfo}>
      {selectedPokemon.card.talent.description}
    </Text>

    {selectedPokemon.card.talent.type ===
      'passive' && (
      <Text style={styles.actionInfo}>
        🔵 Talent passif — toujours actif
      </Text>
    )}
  </View>
)}
  Attaques
</Text>

{selectedPokemon.paralyzed && (
  <Text style={styles.actionInfo}>
    État : ⚡ Paralysé
  </Text>
)}

{selectedPokemon.confused && (
  <Text style={styles.actionInfo}>
    État : 🌀 Confus
  </Text>
)}

{selectedPokemon.asleep && (
  <Text style={styles.actionInfo}>
    État : 😴 Endormi
  </Text>
)}

{selectedPokemon.card.attacks.map(
  (attack, index) => (
    <Pressable
      key={`${attack.name}-${index}`}
      onPress={() => {
        setSelectedAttackIndex(index);

        setMessage(
  `${attack.name} sélectionnée : ${getDisplayedAttackDamage(
    selectedPokemon,
    attack,

    readyCoinAttack &&
    readyCoinAttack.cellName ===
      selectedPokemonCell &&
    readyCoinAttack.attackIndex ===
      index
      ? readyCoinAttack.coinResult
      : undefined
  )} dégâts, coût ${formatAttackCost(attack)}.`
);
      }}
      style={[
        styles.attackChoice,
        selectedAttackIndex === index &&
          styles.selectedAttackChoice,
      ]}
    >
      <Text style={styles.attackChoiceName}>
        {attack.name}
      </Text>

      <Text style={styles.attackChoiceInfo}>
        {formatAttackCost(attack)}
        {' • '}
        Dégâts : {
  getDisplayedAttackDamage(
    selectedPokemon,
    attack,

    readyCoinAttack &&
    readyCoinAttack.cellName ===
      selectedPokemonCell &&
    readyCoinAttack.attackIndex ===
      index
      ? readyCoinAttack.coinResult
      : undefined
  )
}
      </Text>
{attack.effectText && (
  <Text style={styles.attackEffectText}>
    {attack.effectText}
  </Text>
)}
    {attack.effects?.map((effect, index) => (
  <Text
    key={`${effect.type}-${index}`}
    style={styles.attackEffectText}
  >
    {effect.type === 'heal' &&
      `Soigne ${effect.amount} PV`}

    {effect.type === 'discardEnergy' &&
      `Défausse ${effect.amount} Énergie(s)`}

    {effect.type === 'recoil' &&
      `Subit ${effect.amount} dégâts de recul`}
  </Text>
))}
    </Pressable>
  )
)}

            <Pressable
              onPress={tryAttackSelectedPokemon}
              style={styles.attackButton}
            >
              <Text style={styles.attackButtonText}
              >
                ⚔️ ATTAQUER
              </Text>
            </Pressable>

            <Pressable
  onPress={retreatSelectedPokemon}
  style={styles.retreatButton}
>
  <Text style={styles.retreatButtonText}>
    🔄 RETRAITE
  </Text>
</Pressable>
          </View>
        )}
 
  {/* CARTE DRESSEUR SÉLECTIONNÉE */}
{selectedTrainerCard && (
  <View style={styles.actionBox}>
    <Text style={styles.actionTitle}>
      {selectedTrainerCard.name}
    </Text>

    <Text style={styles.actionInfo}>
      {selectedTrainerCard.category === 'objet'
        ? 'Objet'
        : 'Supporter'}
    </Text>

    <Text style={styles.actionInfo}>
      {selectedTrainerCard.description}
    </Text>

    {selectedTrainerCard.effect ===
  'summonTwoBase60' &&
  selectedTrainerOwner && (
    <View>
      <Text
        style={
          styles.attackTitle
        }
      >
        ✨ Invocations associées
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 8,
        }}
      >
        {(
          selectedTrainerOwner === 1
            ? player1InvocationCards
            : player2InvocationCards
        ).map(
          (card, index) => (
            <View
              key={
                `invocation-preview-${selectedTrainerOwner}-${card.id}-${index}`
              }
              style={
                styles
                  .handPokemonPressable
              }
            >
              <PokemonHandCard
                card={card}
              />
            </View>
          )
        )}
      </View>
    </View>
)}

    {selectedTrainerOwner ===
    currentPlayer &&
  selectedTrainerCard.effect !==
    'coinReturnPokemonToHand' &&
  !trainerEffectActivated &&
  !pendingCoinFlip && (
    <Pressable
      onPress={() => {
  if (
    selectedTrainerCard.effect ===
      'summonTwoBase60'
  ) {
    activateInvocationSupporter();

    return;
  }

  activateSelectedTrainerCard();
}}
      style={styles.attackButton}
    >
      <Text
        style={
          styles.attackButtonText
        }
      >
        ▶ ACTIVER
      </Text>
    </Pressable>
)}

    {selectedTrainerCard.coinCount &&
      !pendingCoinFlip && (
        <Button
          title={`🪙 Lancer ${selectedTrainerCard.coinCount} pièce${
            selectedTrainerCard.coinCount > 1
              ? 's'
              : ''
          }`}
          onPress={() =>
            startTrainerCoinFlip(
              selectedTrainerCard,
              currentPlayer,
              selectedTrainerCard.coinCount!
            )
          }
        />
      )}
  </View>
)}


{/* LANCER DE PIÈCES — INDÉPENDANT DU DRESSEUR */}
{pendingCoinFlip && (
  <View style={styles.actionBox}>
    <Text style={styles.actionTitle}>
      🪙 Lancer de pièces
    </Text>

    <Text style={styles.actionInfo}>
      {pendingCoinFlip.sourceName}
    </Text>

    <Text style={styles.actionInfo}>
      Nombre de pièces :{' '}
      {pendingCoinFlip.coinCount}
    </Text>

    {pendingCoinFlip.resolution.choiceAllowed ? (
      <Text style={styles.actionInfo}>
        Choisis le résultat :
      </Text>
    ) : (
      <Text style={styles.actionInfo}>
        {pendingCoinFlip.resolution.reason ===
        'history'
          ? 'Résultat imposé par le lancer précédent.'
          : 'Résultat imposé par une carte Dresseur.'}
      </Text>
    )}

    {coinDraft.map((side, index) => (
      <View
        key={index}
        style={{
          marginVertical: 5,
        }}
      >
        <Text style={styles.actionInfo}>
          Pièce {index + 1} :{' '}
          {side === 'face'
            ? 'FACE'
            : side === 'pile'
            ? 'PILE'
            : '?'}
        </Text>

        {pendingCoinFlip.resolution
          .choiceAllowed && (
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <Button
              title="FACE"
              onPress={() =>
                chooseCoinSide(
                  index,
                  'face'
                )
              }
            />

            <Button
              title="PILE"
              onPress={() =>
                chooseCoinSide(
                  index,
                  'pile'
                )
              }
            />
          </View>
        )}
      </View>
    ))}

    <Button
      title="Valider le lancer"
      onPress={
        validatePendingCoinFlip
      }
    />
  </View>
)}


{/* FIN DU PANNEAU DE DROITE */}
</View>

{/* FIN DE battleAreaRow */}
</View>

{/* FIN DE LA ZONE PLATEAU + PANNEAU */}
</ScrollView>
      {/* JOUEUR 2 */}

      <Text style={styles.info}>
        Pose : C1 à C4 • Retraite : C → D
      </Text>

      <View style={styles.playerHandRow}>

  <PlayerTargetCard
    player={2}
    damage={player2Damage}
    status={player2Status}
    onPress={() =>
      handlePlayerTargetPress(2)
    }
    selectable={
      canSelectPlayerTarget(2)
    }
  />

  <View style={styles.playerHandContent}>

      <Text style={styles.handTitle}>
       Main du joueur 2
      </Text>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={true}
  contentContainerStyle={styles.hand}
  style={styles.handScroll}
>
      {player2Hand.length > 0 ? (
  player2Hand.map((card) =>
    isPokemonCard(card) ? (

      // POKÉMON
      <View
  key={`j2-${card.id}`}
  style={[
    styles.handPokemonSelectionBorder,

    currentPlayer === 2 &&
    selectedCard?.id === card.id
      ? styles.handPokemonSelected
      : styles.handPokemonNotSelected,
  ]}
>
  <Pressable
    onPress={() =>
      handleHandCardPress(
        card,
        2
      )
    }
    style={[
      styles.handPokemonPressable,

      currentPlayer !== 2 &&
        styles.disabledCard,
    ]}
  >
    <PokemonHandCard
      card={card}
    />
  </Pressable>
</View>

    ) : (

      // DRESSEUR
      <TrainerHandCard
        key={`j2-${card.id}`}
        card={card}
        disabled={
  currentPlayer !== 2 &&
  card.effect !==
    'summonTwoBase60'
}
        isSelected={
  selectedTrainerOwner === 2 &&
  selectedTrainerCard?.id ===
    card.id
}
        onPress={() =>
          handleHandCardPress(
            card,
            2
          )
        }
      />

    )
  )
) : (
  <Text style={styles.emptyHand}>
    Aucune carte
  </Text>
)}

</ScrollView>

  </View>
</View>

<Pressable
  style={styles.discardBox}
  onPress={() => {
    setOpenedDiscardPlayer(
      (previous) =>
        previous === 2
          ? null
          : 2
    );
  }}
>
  <Text style={styles.discardTitle}>
   🗑️ Défausse J2 :{' '}
{player2Discard.length +
  player2DiscardEnergies.length}
  </Text>

  {player2Discard.map((card, index) => (
    <Text
      key={`${card.id}-${index}`}
      style={styles.discardCard}
    >
      {card.name}
    </Text>
  ))}

{player2DiscardEnergies.map((energy, index) => (
  <Text
    key={`energy-j2-${index}`}
    style={styles.discardCard}
  >
    {getTypeIcon(energy)} Énergie
  </Text>
))}

</Pressable>
      {/* MESSAGE */}

      <View style={styles.messageBox}>
        <Text style={styles.message}>
          {message}
        </Text>
      </View>

      {!gameOver && (
        <Pressable
          onPress={() => endTurn()}
          style={styles.endTurnButton}
        >
          <Text
            style={styles.endTurnText}
          >
            FIN DU TOUR
          </Text>
        </Pressable>
      )}
      <Pressable
  onPress={restartSameCards}
  style={styles.restartButton}
>
  <Text
    style={styles.restartButtonText}
  >
    🔄 RECOMMENCER AVEC LES MÊMES CARTES
  </Text>
</Pressable>

<Pressable
  onPress={restartGame}
  style={styles.restartButton}
>
  <Text
    style={styles.restartButtonText}
  >
    ↩️ REVENIR AU CHOIX DES CARTES
  </Text>
</Pressable>
    </ScrollView>
  );
}