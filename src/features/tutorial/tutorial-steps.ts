// =====================================================================
// DIDACTICIEL : le parcours
//
// Tu peux modifier ce fichier toi-même : les textes, l'ordre des étapes,
// ce que le joueur a le droit de faire et ce que joue l'adversaire.
//
// Une étape :
//   text      : le texte affiché entre la main et le plateau
//   allow     : ce que le joueur a le droit de faire (tout le reste est bloqué)
//   done      : ce qui doit être fait pour que OK passe à l'étape suivante
//   opponent  : ce que l'adversaire joue tout seul au début de l'étape
//
// Sans `done`, OK passe tout de suite à la suite (étape d'explication).
// Les noms de cartes s'écrivent comme dans le jeu (« Tortank EX », « Lances-Flammes »…).
// =====================================================================

/** Ce que le joueur a le droit de faire pendant l'étape. */
export type TutorialAllow = {
  // cartes de SA main sur lesquelles il peut appuyer
  hand?: string[];
  // cases du plateau sur lesquelles il peut appuyer
  cells?: string[];
  // choisir une attaque et appuyer sur Attaquer
  attack?: boolean;
  // appuyer sur Fin du tour (seulement quand le reste de l'étape est fait)
  endTurn?: boolean;
  // appuyer sur Activer (carte Dresseur)
  trainer?: boolean;
  // lancer de pièce : true = libre, 'face' / 'pile' = seulement ce côté
    coin?: boolean | 'face' | 'pile';
  // avec coin: true, nombre exact de côtés Face à choisir (ex : 2 sur 3 pièces)
  coinFaces?: number;
  // bouton « Utiliser le talent »
  talent?: boolean;
  // bouton « Annuler le tour »
  undo?: boolean;
  // appuyer sur le joueur adverse
  player?: boolean;
  retreat?: boolean;
};

/** Ce qui doit être fait pour passer à la suite (tout doit être vrai). */
export type TutorialCheck =
  // la carte est sélectionnée dans la main
  | { selectedHand: string }
  // ce Pokémon est sur cette case
  | { pokemonAt: string; name: string }
  // le Pokémon de cette case est sélectionné (ses infos sont à droite)
  | { selected: string }
  // le Pokémon de cette case a attaqué
  | { attacked: string }
  // c'est le tour de ce joueur (2 = le joueur a fini son tour)
  | { turnOf: 1 | 2 }
  // le Pokémon de cette case a au moins ce nombre d'Énergies
  | { energiesAtLeast: number; cell: string }
  // le talent du Pokémon de cette case a été utilisé ce tour
  | { talentUsed: string }
  // cette carte Dresseur a été jouée (elle est dans la défausse)
  | { played: string }
  // un effet attend que le joueur clique sur un Pokémon (après une pièce, par exemple)
  | { waitingForTarget: true }
  // le joueur a appuyé sur « Annuler le tour »
  | { undone: true };

/** Ce que l'adversaire joue tout seul. */
export type TutorialOpponentAction =
  // poser un Pokémon de sa main sur une case
  | { place: string; cell: string }
    // attaquer avec le Pokémon de cette case ;
  // `target` : la case choisie ensuite (cible de l'attaque, Pokémon qui reçoit l'Énergie…),
  // `targets` : plusieurs cases choisies l'une après l'autre
  | { attack: string; with: string; target?: string; targets?: string[] }
  // finir son tour
  | { endTurn: true };

export type TutorialStep = {
  text: string;
  allow?: TutorialAllow;
  done?: TutorialCheck[];
  opponent?: TutorialOpponentAction[];
};

/** Un didacticiel complet : la série, les deux decks et les étapes. */
export type TutorialCourse = {
  title: string;
  series: 'tcg-pocket' | 'soleil-lune';
  playerDeck: string[];
  opponentDeck: string[];
  playerSummons?: Record<string, string[]>;
  opponentSummons?: Record<string, string[]>;
  opponentStarts?: boolean;
  steps: TutorialStep[];
};

// ---------------------------------------------------------------------
// LES DECKS (série TCG Pocket ; aucune restriction de deck ni de pose)
// ---------------------------------------------------------------------

const TRAINERS = ['Potion', 'Vitesse+', 'Pokeball', 'Erika', 'Ondine'];

export const TUTORIAL_PLAYER_DECK = [
  
  'Tartard',
  'Fragilady',
  'Papilusion',
  
  'Feunard',
  
  ...TRAINERS,
];

export const TUTORIAL_OPPONENT_DECK = [
  'Herbizarre',
  
  'Fragilady',
  'Tortank EX',
  'Feunard',
  
  ...TRAINERS,
];

// ---------------------------------------------------------------------
// LES ÉTAPES
// ---------------------------------------------------------------------

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    text: "Bienvenue dans l'arène ! Le but est d'infliger le plus de dégâts possible au joueur adverse.",
  },
  {
    text: 'Appuie sur Feunard dans ta main.',
    allow: { hand: ['Feunard'] },
    done: [{ selectedHand: 'Feunard' }],
  },
  {
    text: 'Pose Feunard sur la case B3.',
    allow: { hand: ['Feunard'], cells: ['B3'] },
    done: [{ pokemonAt: 'B3', name: 'Feunard' }],
  },
  {
    text: 'Feunard apparaît avec 2 Énergies.',
  },
  {
    text: 'Appuie sur Feunard sur le plateau : les infos de la carte apparaissent à droite.',
    allow: { cells: ['B3'] },
    done: [{ selected: 'B3' }],
  },
  {
    text: 'Appuie sur son attaque Lance-Flammes, puis sur le bouton Attaquer.',
    allow: { cells: ['B3'], attack: true },
    done: [{ attacked: 'B3' }],
  },
  {
    text: "Comme aucun Pokémon adverse n'est sur la colonne en face de Feunard, l'attaque cible le joueur adverse.",
  },
  {
    text: 'Le joueur adverse subit 90 dégâts, et Feunard défausse une Énergie.',
  },
  {
    text: 'Appuie sur Fin du tour, tout en bas.',
    allow: { endTurn: true },
    done: [{ turnOf: 2 }],
  },
  {
    text: "L'adversaire pose Herbizarre en C3.",
    opponent: [{ place: 'Herbizarre', cell: 'C3' }],
  },
  {
    text: "Herbizarre apparaît avec 2 Énergies : il ne peut donc pas utiliser Tranche'Herbe.",
  },
  {
    text: "L'adversaire a fini de jouer : Feunard récupère 1 Énergie.",
    opponent: [{ endTurn: true }],
  },
  {
    text: 'Attaque Herbizarre avec Lance-Flammes.',
    allow: { cells: ['B3'], attack: true },
    done: [{ attacked: 'B3' }],
  },
  {
    text: 'Herbizarre est mis K.O. : le joueur adverse subit 20 dégâts, car Herbizarre est un Niveau 1.',
  },
  {
    text: 'Mets fin à ton tour.',
    allow: { endTurn: true },
    done: [{ turnOf: 2 }],
  },
  {
    text: "L'adversaire pose Tortank EX en C2 : il récupère 2 Énergies.",
    opponent: [{ place: 'Tortank EX', cell: 'C2' }],
  },
  {
    text: 'Tortank EX attaque avec Surf et inflige 40 dégâts à ton joueur.',
    opponent: [{ attack: 'Surf', with: 'C2' }],
  },
  {
    text: 'Pose Tartard en face de Tortank EX, sur la case B2.',
    opponent: [{ endTurn: true }],
    allow: { hand: ['Tartard'], cells: ['B2'] },
    done: [{ pokemonAt: 'B2', name: 'Tartard' }],
  },
  {
    text: "Tartard récupère 2 Énergies, mais ne peut pas utiliser son attaque Ultimapoing : il lui manque une Énergie.",
  },
  {
    text: 'Appuie sur la carte Supporter Ondine, puis sur Activer. Choisis Face, puis appuie sur Valider le lancer.',
    allow: { hand: ['Ondine'], trainer: true, coin: 'face' },
    done: [{ waitingForTarget: true }],
  },
  {
    text: "Appuie maintenant sur Tartard pour qu'il récupère une Énergie.",
    allow: { cells: ['B2'] },
    done: [{ energiesAtLeast: 3, cell: 'B2' }],
  },
  {
    text: 'Maintenant, Tartard peut utiliser son attaque Ultimapoing : utilise-la.',
    allow: { cells: ['B2'], attack: true },
    done: [{ attacked: 'B2' }],
  },
  {
    text: "Tortank EX subit 80 dégâts : il ne lui reste que 100 PV. Si tu l'attaques au prochain tour, il ne sera pas encore K.O.",
  },
  {
    text: 'Attaque maintenant avec Feunard pour infliger des dégâts au joueur adverse, puis finis ton tour.',
    allow: { cells: ['B3'], attack: true, endTurn: true },
    done: [{ attacked: 'B3' }, { turnOf: 2 }],
  },
  {
    text: 'Tortank EX récupère 1 Énergie : il peut maintenant utiliser Aquazooka.',
  },
  {
    text: 'Ton Tartard subit 100 dégâts, mais Tortank EX subit 20 dégâts grâce au talent Contre-Attaque de Tartard.',
    opponent: [{ attack: 'Aquazooka', with: 'C2' }],
  },
  {
    text: 'Tortank EX est maintenant à portée du K.O. de ton Tartard.',
  },
  {
    text: "L'adversaire pose Feunard en C3 et utilise l'attaque Lance-Flammes.",
    opponent: [
      { place: 'Feunard', cell: 'C3' },
      { attack: 'Lances-Flammes', with: 'C3' },
    ],
  },
  {
    text: 'Ton Feunard est mis K.O. et ton joueur subit 20 dégâts.',
  },
  {
    text: "Tartard ne récupère pas d'Énergie : il a déjà toutes les Énergies demandées par son attaque la plus coûteuse.",
    opponent: [{ endTurn: true }],
  },
  {
    text: "Utilise l'attaque Ultimapoing de Tartard.",
    allow: { cells: ['B2'], attack: true },
    done: [{ attacked: 'B2' }],
  },
  {
    text: "Tortank EX est mis K.O. : comme c'est un Pokémon EX, le joueur adverse subit 50 dégâts.",
  },
  {
    text: 'Pose maintenant Papilusion en B3 et utilise son talent.',
    allow: { hand: ['Papilusion'], cells: ['B3'], talent: true },
    done: [{ pokemonAt: 'B3', name: 'Papilusion' }, { talentUsed: 'B3' }],
  },
  {
    text: "Tartard se soigne de 20 : il est maintenant hors de portée du K.O. du Fragilady de ton adversaire.",
  },
  {
    text: 'Finis ton tour.',
    allow: { endTurn: true },
    done: [{ turnOf: 2 }],
  },
  {
    text: "L'adversaire pose Fragilady en C2 et utilise son attaque Provision de Feuillage : Tartard subit 50 dégâts.",
    opponent: [
      { place: 'Fragilady', cell: 'C2' },
      { attack: 'Provision de Feuillage', with: 'C2' },
    ],
  },
  {
    text: "Comme l'adversaire n'a pas de Pokémon Plante de banc, l'effet de l'attaque ne s'applique pas.",
  },
  {
    text: 'Feunard utilise son attaque Lance-Flammes : Papilusion subit 90 dégâts.',
    opponent: [{ attack: 'Lances-Flammes', with: 'C3' }],
  },
  {
    text: 'Papilusion récupère 1 Énergie.',
    opponent: [{ endTurn: true }],
  },
  {
    text: 'Pose ton Fragilady en B1 et utilise son attaque Provision de Feuillage, puis choisis Papilusion.',
    allow: { hand: ['Fragilady'], cells: ['B1', 'B3'], attack: true },
    done: [{ pokemonAt: 'B1', name: 'Fragilady' }, { attacked: 'B1' }],
  },
  {
    text: "Papilusion récupère 1 Énergie : les Énergies peuvent dépasser le coût de l'attaque la plus coûteuse quand elles viennent d'une attaque, d'un talent ou d'une carte Dresseur.",
  },
  {
    text: 'Le joueur adverse subit 50 dégâts.',
  },
  {
    text: 'Attaque avec ton Papilusion.',
    allow: { cells: ['B3'], attack: true },
    done: [{ attacked: 'B3' }],
  },
  {
    text: "Tu ne peux plus attaquer avec Tartard : les attaques se font dans un certain ordre, soit de droite à gauche, soit de gauche à droite. Appuie sur Annuler le tour, tout en bas.",
    allow: { cells: ['B2'], attack: true, undo: true },
    done: [{ undone: true }],
  },
  {
    text: 'Utilise la carte Supporter Erika sur Papilusion pour lui soigner 50 dégâts.',
    allow: { hand: ['Erika'], trainer: true, cells: ['B3'] },
    done: [{ played: 'Erika' }],
  },
  {
    text: 'Utilise le talent de Papilusion pour lui soigner 20 dégâts.',
    allow: { cells: ['B3'], talent: true },
    done: [{ talentUsed: 'B3' }],
  },
  {
    text: "Maintenant, Papilusion n'est plus à portée du K.O. de Feunard.",
  },
  {
    text: 'Pose maintenant Fragilady en B1 et utilise les attaques de tes Pokémon de gauche à droite ou de droite à gauche. Une fois fini, mets fin à ton tour.',
    allow: { hand: ['Fragilady'], cells: ['B1', 'B2', 'B3'], attack: true, endTurn: true },
    done: [{ pokemonAt: 'B1', name: 'Fragilady' }, { turnOf: 2 }],
  },
  {
    text: "Bravo, tu as gagné ! Tu as infligé 320 dégâts au joueur adverse et tu n'as subi que 60 dégâts.",
  },
];

/** Étape 1 du didacticiel : les bases du jeu. */
export const BASE_COURSE: TutorialCourse = {
  title: 'Base du jeu',
  series: 'tcg-pocket',
  playerDeck: TUTORIAL_PLAYER_DECK,
  opponentDeck: TUTORIAL_OPPONENT_DECK,
  steps: TUTORIAL_STEPS,
};
