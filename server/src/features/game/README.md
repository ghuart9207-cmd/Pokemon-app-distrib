# Pokémon TCG Plateau — code du jeu

`src/app/` ne contient que les **routes** Expo Router. Tout le jeu vit ici, dans `src/features/game/`.

```
src/features/game/
├── screens/        Écrans : game-screen (point d'entrée), préparation des cartes, écran de combat
├── components/     Composants d'affichage (cartes, plateau, panneaux, zones joueur)
├── hooks/          Logique du jeu, un hook par sujet (use-game-*)
│   ├── state/      Tout l'état React (use-game-state)
│   ├── cell-press/ Un fichier par scénario de clic sur une case du plateau
│   └── attack-resolution/  Les grandes étapes de résolution d'une attaque
├── rules/          Règles pures (sans React) : pile ou face, attaques, K.O., fin de tour…
├── data/           Les cartes : un fichier par Pokémon (pokemon/) et par Dresseur (trainers/)
├── types/          Types TypeScript partagés (cartes, plateau, pile ou face, choix en attente)
├── utils/          Petits helpers d'affichage (libellés, icônes)
└── styles/         Styles partagés entre plusieurs composants
```

## Comment ça s'assemble

1. `screens/game-screen.tsx` appelle `useGame()` puis affiche l'écran qui correspond à la phase
   (préparation des cartes, choix des invocations, combat).
2. `hooks/use-game.ts` crée l'état (`useGameState`) et appelle tous les hooks `use-game-*`.
   Chaque hook reçoit l'état partagé plus les fonctions produites par les hooks précédents :
   **l'ordre des appels suit donc les dépendances**.
3. Un clic sur une case passe par `use-game-cell-interactions.ts`, qui essaie les handlers de
   `hooks/cell-press/` dans l'ordre : le premier qui renvoie `true` a traité le clic.

## Conventions

- Les styles d'un composant sont dans `<composant>.styles.ts`, à côté de lui. Ceux utilisés par
  plusieurs fichiers sont dans `styles/shared-styles.ts`.
- Les imports entre dossiers passent par l'alias `@/features/game/...` ; les dossiers `types`,
  `data` et `rules` ont un `index.ts` (on importe le dossier, pas le fichier).
- Les règles (`rules/`) ne dépendent jamais de React : elles prennent des valeurs et en renvoient.

## Ajouter une carte

1. Crée l'image dans `assets/images/`.
2. Crée `data/pokemon/<nom>.ts` (ou `data/trainers/<nom>.ts`) en t'inspirant d'une carte existante.
3. Exporte-la dans `data/pokemon/index.ts` (ou `trainers/index.ts`) et ajoute-la à `data/all-cards.ts`.
4. Si elle a un nouvel effet, ajoute-le dans les types (`types/cards.ts`) puis dans les règles.
