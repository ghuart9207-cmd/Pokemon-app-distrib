// =====================================================================
// DIDACTICIEL — ÉTAPE 2 : APPROFONDISSEMENT
//
// Même écriture que tutorial-steps.ts (étape 1).
// Les decks sont propres à cette étape (indépendants de l'étape 1).
// =====================================================================

import type { TutorialCourse } from './tutorial-steps';

/** Main du joueur à l'étape 2. */
const ADVANCED_PLAYER_DECK = [
  'Fragilady',
  'Rafflesia',
  'Feunard',
  'Tartard',
  'Dracaufeu EX',
  'Sulfura EX',
  'Pokeball',
  'Vitesse+',
];

/** Main de l'adversaire à l'étape 2. */
const ADVANCED_OPPONENT_DECK = [
  'Tortank EX',
  'Feunard',
  'Herbizarre',
  'Fragilady',
  'Florizarre EX',
  'Dracaufeu',
];

export const ADVANCED_COURSE: TutorialCourse = {
  title: 'Approfondissement',
  series: 'tcg-pocket',
  playerDeck: ADVANCED_PLAYER_DECK,
  opponentDeck: ADVANCED_OPPONENT_DECK,
  // La Pokeball du joueur invoque Noeunoeuf.
  playerSummons: { Pokeball: ['Noeunoeuf'] },
  // C'est l'adversaire qui commence (il pose Tortank EX).
  opponentStarts: true,
  steps: [
    {
      text: "Bienvenue dans l'approfondissement ! Ici, tu vas découvrir les règles plus avancées du jeu.",
    },
    {
      text: "L'adversaire pose Tortank EX en C3.",
      opponent: [{ place: 'Tortank EX', cell: 'C3' }],
    },
    {
      text: 'Tortank EX attaque avec Surf et inflige 40 dégâts à ton joueur.',
      opponent: [{ attack: 'Surf', with: 'C3' }],
    },
    {
      text: "À ton tour ! Si tu poses Fragilady en B3, elle sera à portée du K.O. de Tortank EX.",
      opponent: [{ endTurn: true }],
    },
    {
      text: 'Active la carte Objet Pokeball et pose Noeunoeuf devant Tortank EX, en B3, pour protéger ton joueur.',
      allow: { hand: ['Pokeball'], trainer: true, cells: ['B3'] },
      done: [{ played: 'Pokeball' }, { pokemonAt: 'B3', name: 'Noeunoeuf' }],
    },
    {
      text: 'Comme Noeunoeuf est une Invocation, il apparaît sans Énergie et ne peut pas être ciblé par les cartes Dresseur.',
    },
    {
      text: 'Pose ton Fragilady en B2 et utilise son attaque Provision de Feuillage, puis choisis Noeunoeuf.',
      allow: { hand: ['Fragilady'], cells: ['B2', 'B3'], attack: true },
      done: [{ pokemonAt: 'B2', name: 'Fragilady' }, { attacked: 'B2' }],
    },
    {
      text: "Utilise maintenant l'attaque Canon Graine de Noeunoeuf, puis mets fin à ton tour.",
      allow: { cells: ['B3'], attack: true, endTurn: true },
      done: [{ attacked: 'B3' }, { turnOf: 2 }],
    },
    {
      text: "L'adversaire pose Feunard en C2 et utilise l'attaque Lances-Flammes.",
      opponent: [
        { place: 'Feunard', cell: 'C2' },
        { attack: 'Lances-Flammes', with: 'C2' },
      ],
    },
    {
      text: 'Tortank EX attaque avec Aquazooka : Noeunoeuf est mis K.O. et ton joueur subit 10 dégâts.',
      opponent: [{ attack: 'Aquazooka', with: 'C3' }],
    },
    {
      text: 'Pose Rafflesia en face de Tortank EX.',
      opponent: [{ endTurn: true }],
      allow: { hand: ['Rafflesia'], cells: ['B3'] },
      done: [{ pokemonAt: 'B3', name: 'Rafflesia' }],
    },
    {
      text: 'Attaque avec ton Fragilady et choisis Rafflesia.',
      allow: { cells: ['B2', 'B3'], attack: true },
      done: [{ attacked: 'B2' }],
    },
    {
      text: 'Attaque avec ton Rafflesia et choisis Face. Tortank EX est maintenant Endormi : il ne peut ni battre en retraite, ni attaquer pendant son prochain tour.',
      allow: { cells: ['B3'], attack: true, coin: 'face' },
      done: [{ attacked: 'B3' }],
    },
    {
      text: 'Mets fin à ton tour.',
      allow: { endTurn: true },
      done: [{ turnOf: 2 }],
    },
    {
      text: "L'adversaire pose Herbizarre en C4 et utilise l'attaque Lances-Flammes avec son Feunard. Fragilady est mise K.O. et ton joueur subit 20 dégâts.",
      opponent: [
        { place: 'Herbizarre', cell: 'C4' },
        { attack: 'Lances-Flammes', with: 'C2' },
      ],
    },
    {
      text: 'Pose ton Feunard en face du Feunard adverse et utilise son attaque Lances-Flammes. Feunard est mis K.O. et le joueur adverse subit 20 dégâts.',
      opponent: [{ endTurn: true }],
      allow: { hand: ['Feunard'], cells: ['B2'], attack: true },
      done: [{ pokemonAt: 'B2', name: 'Feunard' }, { attacked: 'B2' }],
    },
    {
      text: "Attaque avec ton Rafflesia : Tortank EX est mis K.O. et le joueur adverse subit 50 dégâts. Comme tu avais choisi Face au dernier tour, ce lancer était forcément Pile : Tortank EX n'aurait donc pas été Endormi.",
      allow: { cells: ['B3'], attack: true, coin: true },
      done: [{ attacked: 'B3' }],
    },
    {
      text: 'Mets fin à ton tour.',
      allow: { endTurn: true },
      done: [{ turnOf: 2 }],
    },
    {
      text: "L'adversaire pose Fragilady en C2.",
      opponent: [{ place: 'Fragilady', cell: 'C2' }],
    },
    {
      text: "L'adversaire utilise Provision de Feuillage avec Fragilady et donne une Énergie à Herbizarre.",
      opponent: [{ attack: 'Provision de Feuillage', with: 'C2', target: 'C4' }],
    },
    {
      text: "Herbizarre utilise l'attaque Tranche’Herbe : ton joueur subit 60 dégâts.",
      opponent: [{ attack: 'Tranche’Herbe', with: 'C4' }],
    },
    {
      text: "Ton Feunard est à portée de K.O. Pour le protéger, utilise sa retraite : comme son coût de retraite est de 1, Feunard défaussera 1 Énergie.",
      opponent: [{ endTurn: true }],
    },
    {
      text: "Pour que Feunard ne défausse pas d'Énergie et qu'il puisse encore attaquer, utilise Vitesse+ sur lui.",
      allow: { hand: ['Vitesse+'], trainer: true, cells: ['B2'] },
      done: [{ played: 'Vitesse+' }],
    },
    {
      text: 'Utilise maintenant sa retraite : appuie sur Feunard, puis sur Retraite pour passer de la case B2 à A2.',
      allow: { cells: ['B2'], retreat: true },
      done: [{ pokemonAt: 'A2', name: 'Feunard' }],
    },
    {
      text: 'Pose Tartard en face de Fragilady pour protéger ton Feunard.',
      allow: { hand: ['Tartard'], cells: ['B2'] },
      done: [{ pokemonAt: 'B2', name: 'Tartard' }],
    },
    {
      text: 'Attaque maintenant avec Feunard.',
      allow: { cells: ['A2'], attack: true },
      done: [{ attacked: 'A2' }],
    },
    {
      text: 'Attaque avec ton Rafflesia et finis ton tour.',
      allow: { cells: ['B3'], attack: true, endTurn: true },
      done: [{ attacked: 'B3' }, { turnOf: 2 }],
    },
    {
      text: "L'adversaire pose Florizarre EX en C1.",
      opponent: [{ place: 'Florizarre EX', cell: 'C1' }],
    },
    {
      text: "Herbizarre utilise l'attaque Tranche’Herbe : ton joueur subit 60 dégâts.",
      opponent: [{ attack: 'Tranche’Herbe', with: 'C4' }],
    },
    {
      text: 'Fragilady utilise Provision de Feuillage et donne une Énergie à Florizarre EX. Fragilady subit 20 dégâts du talent de Tartard et est mise K.O.',
      opponent: [{ attack: 'Provision de Feuillage', with: 'C2', target: 'C1' }],
    },
    {
      text: "Florizarre EX utilise l'attaque Tranche’Herbe : ton joueur subit 60 dégâts.",
      opponent: [{ attack: 'Tranche’Herbe', with: 'C1' }],
    },
    {
      text: 'Pose Dracaufeu EX en face de Florizarre EX.',
      opponent: [{ endTurn: true }],
      allow: { hand: ['Dracaufeu EX'], cells: ['B1'] },
      done: [{ pokemonAt: 'B1', name: 'Dracaufeu EX' }],
    },
    {
      text: "Attaque maintenant avec tes Pokémon, puis mets fin à ton tour. Attention à respecter l'ordre d'attaque : de droite à gauche ou de gauche à droite, et sur une même colonne, le Pokémon en B attaque avant le Pokémon en A. Tu peux toujours annuler ton tour si tu t'es trompé.",
      allow: {
        cells: ['B1', 'B2', 'B3', 'B4', 'A1', 'A2', 'A3', 'A4'],
        attack: true,
        endTurn: true,
        undo: true,
      },
      done: [{ attacked: 'B3' }, { attacked: 'B2' }, { attacked: 'A2' }, { turnOf: 2 }],
    },
    {
      text: "L'adversaire pose Dracaufeu en C2.",
      opponent: [{ place: 'Dracaufeu', cell: 'C2' }],
    },
    {
      text: "Herbizarre utilise l'attaque Tranche’Herbe : ton joueur subit 60 dégâts.",
      opponent: [{ attack: 'Tranche’Herbe', with: 'C4' }],
    },
    {
      text: "Florizarre EX utilise l'attaque Pousse Géante : Dracaufeu EX subit 100 dégâts.",
      opponent: [{ attack: 'Pousse Géante', with: 'C1' }],
    },
    {
      text: 'Pose maintenant Sulfura EX sur la seule case libre de la ligne B.',
      opponent: [{ endTurn: true }],
      allow: { hand: ['Sulfura EX'], cells: ['B4'] },
      done: [{ pokemonAt: 'B4', name: 'Sulfura EX' }],
    },
    {
      text: "Utilise maintenant l'attaque Danse Infernale de Sulfura EX pour charger Dracaufeu EX en Énergies. Choisis 2 côtés Face, car pour avoir toutes les pièces sur Face, il faut avoir eu uniquement des Pile juste avant. Puis choisis Dracaufeu EX.",
      allow: { cells: ['B4', 'B1'], attack: true, coin: true, coinFaces: 2 },
      // À AJUSTER : Énergies de Dracaufeu EX avant l'attaque + 2
      done: [{ attacked: 'B4' }, { energiesAtLeast: 2, cell: 'B1' }],
    },
    {
      text: "Attaque maintenant avec tes autres Pokémon, puis mets fin à ton tour. Attention à respecter l'ordre d'attaque.",
      allow: {
        cells: ['B1', 'B2', 'B3', 'B4', 'A1', 'A2', 'A3', 'A4'],
        attack: true,
        endTurn: true,
        undo: true,
      },
      done: [{ attacked: 'B3' }, { attacked: 'B2' }, { attacked: 'A2' }, { attacked: 'B1' }, { turnOf: 2 }],
    },
    {
      text: "Bravo, tu as gagné ! Tu as infligé 630 dégâts au joueur adverse et tu n'as subi que 310 dégâts.",
    },
  ],
};
