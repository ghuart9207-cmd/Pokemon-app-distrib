# Pokémon TCG Plateau

Jeu de cartes Pokémon au tour par tour, joué sur un **plateau de 16 cases**. Construit avec Expo et React Native, il tourne sur iOS, Android et dans le navigateur.

🎮 **Démo en ligne : [pokemon-app-distrib.vercel.app](https://pokemon-app-distrib.vercel.app)**

<!-- TODO : ajouter 2 ou 3 captures d'écran (écran de préparation, plateau, combat) -->
<!-- ![Aperçu du plateau](docs/screenshots/plateau.png) -->
<img width="1267" height="627" alt="image" src="https://github.com/user-attachments/assets/a0efc94c-cbf9-4ad0-9148-36a67a0d029f" />
<img width="1817" height="845" alt="image" src="https://github.com/user-attachments/assets/22c3b58c-5a80-4c02-9e09-f812f7711339" />

Plateau dézoomé :
<img width="612" height="775" alt="image" src="https://github.com/user-attachments/assets/1c440082-b3ce-432e-81ca-eaf8b328bc9e" />



---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [Guide de contribution : ajouter du contenu](#guide-de-contribution--ajouter-du-contenu)
  - [Ajouter un Pokémon](#1-ajouter-un-pokémon)
  - [Ajouter une attaque](#2-ajouter-une-attaque)
  - [Ajouter un talent](#3-ajouter-un-talent)
  - [Ajouter un Dresseur](#4-ajouter-un-dresseur)
- [Vérifier ses modifications](#vérifier-ses-modifications)
- [Licence](#licence)

---

## Fonctionnalités

- Combats **au tour par tour** sur un plateau de 16 cases
- Écran de **préparation** : les cartes ajoutées au jeu y apparaissent automatiquement
- Cartes Pokémon avec **stades d'évolution** (`base`, `niveau1`, `niveau2`, `mega_ex`) et **variantes** (`normal`, `ex`, `gx`)
- **10 types** : électrique, feu, eau, plante, psy, combat, normal, obscurité, métal, fée
- Système d'**attaques** riche : pile ou face, bonus de dégâts conditionnels, dégâts de banc, recul, soin, etc.
- **Statuts** : poison, brûlure, paralysie, confusion, sommeil
- **Talents passifs** (immunité à un type, survie à un K.O. sur pile ou face, etc.)
- Cartes **Dresseur**
- Multiplateforme : iOS, Android et Web depuis une seule base de code

## Stack technique

| Domaine | Technologie |
| --- | --- |
| Framework | [Expo](https://expo.dev) (SDK 57) + [React Native](https://reactnative.dev) 0.86 |
| Langage | TypeScript |
| UI | React 19, React Native Web |
| Navigation | Expo Router |
| Animations & gestes | Reanimated, Gesture Handler |
| Polices | Bangers, Nunito (Google Fonts via Expo) |
| Déploiement web | Vercel |

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org) (version LTS récente)
- npm
- Pour tester sur mobile : l'application **Expo Go**, ou un émulateur Android / simulateur iOS

### Installation

```bash
git clone https://github.com/ghuart9207-cmd/Pokemon-app-distrib.git
cd Pokemon-app-distrib
npm install
```

### Lancement

```bash
npm start
```

Le terminal affiche un QR code (à scanner avec Expo Go) ainsi que des raccourcis pour ouvrir l'application sur iOS, Android ou dans le navigateur.

<!-- TODO : documenter ici les variables du fichier .env (sans en publier les valeurs) et le rôle du dossier server/ + database.sql si le jeu en a besoin pour fonctionner -->

## Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm start` | Démarre le serveur de développement Expo |
| `npm run android` | Lance l'app sur Android |
| `npm run ios` | Lance l'app sur iOS |
| `npm run web` | Lance l'app dans le navigateur |
| `npm run lint` | Analyse le code avec ESLint |
| `npx tsc --noEmit` | Vérifie les types TypeScript |

## Structure du projet

```
.
├── assets/            # Images (illustrations de cartes, icônes, etc.)
├── scripts/           # Scripts utilitaires
├── server/            # Partie serveur
├── src/
│   └── features/
│       └── game/
│           ├── data/      # Cartes : pokemon/, trainers/, all-cards.ts
│           ├── hooks/     # Logique de jeu (combat, déplacements, état…)
│           ├── rules/     # Règles pures (attaques, plateau)
│           └── types/     # Types TypeScript (cards.ts, pending.ts…)
├── database.sql       # Schéma de base de données
├── app.json           # Configuration Expo
└── package.json
```

---

## Guide de contribution : ajouter du contenu

Les exemples ci-dessous utilisent **Salamèche**. Les chemins sont relatifs à `src/features/game/`.

> 💡 Le plus simple est toujours de **copier une carte existante** qui fait déjà ce que vous voulez, puis de l'adapter. Tous les champs possibles sont définis dans `types/cards.ts` (`Attack`, `AttackEffect`, `PokemonTalent`).

### 1. Ajouter un Pokémon

**Étape 1 : l'image.** Placez-la dans `assets/images/` (ex. `salameche-card.png`).

**Étape 2 : le fichier de la carte.** Créez `data/pokemon/salameche.ts` en vous inspirant de `pikachu.ts` :

```ts
import type { PokemonCard } from '@/features/game/types';

export const salameche: PokemonCard = {
  id: 'salameche-001',        // unique dans tout le jeu
  name: 'Salamèche',
  stage: 'base',              // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',          // 'normal' | 'ex' | 'gx'
  type: 'feu',                // electrique, feu, eau, plante, psy, combat,
                              // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/salameche-card.png'),
  attacks: [
    { name: 'Griffe', damage: 10, energyCost: 1 },
    {
      name: 'Flammèche',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { feu: 1 }, // optionnel : énergies de types précis
    },
  ],
};
```

> Le chemin du `require` doit contenir **5 `../`** : c'est la profondeur du dossier `data/pokemon/` par rapport à la racine du projet.

**Étape 3 : l'exporter.** Dans `data/pokemon/index.ts` :

```ts
export * from './salameche';
```

**Étape 4 : l'ajouter au jeu.** Dans `data/all-cards.ts`, importez la carte et ajoutez-la à `ALL_POKEMON_CARDS` :

```ts
import { salameche } from './pokemon/salameche';

export const ALL_POKEMON_CARDS: PokemonCard[] = [
  chenipan,
  // ...
  salameche,
];
```

La carte apparaît alors automatiquement sur l'écran de préparation.

### 2. Ajouter une attaque

#### Avec ce qui existe déjà

Ajoutez un objet au tableau `attacks` de la carte :

```ts
{
  name: 'Charge Brutale',
  damage: 50,
  energyCost: 2,                             // nombre total d'énergies
  requiredEnergies: { combat: 1 },           // optionnel : types précis exigés
  effects: [{ type: 'recoil', amount: 20 }], // le Pokémon se blesse de 20
  effectText: 'Ce Pokémon s’inflige aussi 20 dégâts.', // texte affiché
}
```

`effectText` n'est que le **texte affiché** : l'effet réel vient de `effects` et des autres champs de l'attaque.

**Champs de `Attack` disponibles :**

| Catégorie | Champs |
| --- | --- |
| Pile ou face | `coinCount`, `coinEffects`, `coinDamageEffects`, `damagePerFace`, `damagePerPile`, `failsOn` |
| Bonus de dégâts | `bonusDamagePerOpponentBenchPokemon`, `bonusDamageIfTargetEvolved`, `bonusDamageIfSwitchedRecently`, `bonusDamageEveryTwoRounds`, `fixedDamage` |
| Cible et banc | `targetMode`, `benchDamageSameTypeAsTarget`, `secondaryBenchOrPlayerDamage` |
| Autres | `blocksNextOwnTurn` |

**Effets disponibles dans `effects` :**
`heal`, `discardEnergy`, `recoverEnergy`, `recoverEnergyToBench`, `switchWithBench`, `discardTypedEnergy`, `recoil`, `poison`, `burn`, `paralyze`, `confuse`, `sleep`, `reduceDamageNextOpponentTurn`, `takeExtraDamageNextTurn`, `healAllOwnAndReturnSelf`, `healSelfByDamageDealt`, `forceOpponentActiveSwitch`, `attachEnergyToBench`, `discardAllTypedEnergyForBonus`.

Le sens du champ `amount` dépend de l'effet : copiez une carte qui utilise déjà cet effet (par exemple **Scarhino** pour `forceOpponentActiveSwitch`).

#### Avec un nouvel effet (types + code)

1. **Déclarez l'effet** dans `types/cards.ts` : ajoutez son nom dans `AttackEffect.type`, ou créez un nouveau champ optionnel dans `Attack`.
2. **Implémentez-le** à l'endroit qui correspond à son comportement :

| L'effet… | Où le coder |
| --- | --- |
| modifie l'attaquant (soin, recul, défausse d'énergie) | `rules/attack-rules.ts`, fonction `applyAttackEffects` (un `if (effect.type === '…')` par effet) |
| change le calcul des dégâts | `getDisplayedAttackDamage` (`rules/attack-rules.ts`) pour l'affichage, et `hooks/use-game-attack-resolution.ts` pour le calcul réel (le bonus par Pokémon de banc y apparaît à deux endroits) |
| agit sur la cible (statut, échange forcé) | `hooks/attack-resolution/hit-opponent-pokemon.ts` |
| demande un choix au joueur | nouveau type dans `types/pending.ts`, état dans `hooks/state/use-game-state.ts`, et un handler dans `hooks/cell-press/` |

Le dernier cas est le plus long car il touche plusieurs fichiers.

### 3. Ajouter un talent

#### Avec ce qui existe déjà

```ts
talent: {
  name: 'Peau de Roche',
  type: 'passive',
  effect: 'preventDamageFromType',
  blockedType: 'feu', // ignore les dégâts des Pokémon de type Feu
  description: 'Évite tous les dégâts infligés par les Pokémon de type Feu.',
},
```

**Effets de talent existants :**

| `effect` | Description | Fichier |
| --- | --- | --- |
| `blockBaseAttacks` | Bloque les attaques des Pokémon de base | `hooks/use-game-movement.ts` |
| `preventDamageFromType` | Ignore les dégâts d'un type (`blockedType`) | `hooks/use-game-combat-support.ts` |
| `damageOpponentOnPlay` | Blesse l'adversaire quand il pose un Pokémon (`amount`) | `rules/board-rules.ts` |
| `surviveKOOnCoin` | Pile ou face pour survivre à un K.O. | `hooks/use-game-combat-support.ts` |
| `preventAllEffectsFromExGx` | Immunise contre les ex et GX | `hooks/use-game-combat-support.ts` |

> ⚠️ **Limite actuelle :** seuls les talents `passive` sont gérés. Le type `'activated'` existe dans les types, mais aucun code ne déclenche un talent activé manuellement et l'interface n'affiche que le texte des talents passifs. Un talent à activer à la main nécessiterait un vrai développement (bouton, état, logique).

#### Avec un nouvel effet

Exemple : un talent « Cuirasse » qui ignore les dégâts des Pokémon de base.

1. Dans `types/cards.ts`, ajoutez `'preventDamageFromBasic'` à la liste `PokemonTalent.effect`.
2. Dans la carte, définissez `effect: 'preventDamageFromBasic'`.
3. Dans `hooks/use-game-combat-support.ts`, fonction `doesTalentPreventDamage`, ajoutez après `const talent = target.card.talent;` :

```ts
if (
  talent?.type === 'passive' &&
  talent.effect === 'preventDamageFromBasic' &&
  attacker.card.stage === 'base'
) {
  return true;
}
```

Cette fonction est appelée pour le Pokémon actif **et** pour les Pokémon de banc visés : un seul endroit suffit.

**Où modifier selon le moment où le talent agit :**

| Le talent… | Où |
| --- | --- |
| empêche des dégâts | `doesTalentPreventDamage` |
| agit à la pose d'un Pokémon | comme `damageOpponentOnPlay` : `rules/board-rules.ts` + handler `hooks/cell-press/handle-pokemon-placement.ts` |
| agit à un K.O. | `hooks/use-game-combat-support.ts` (`handleAttackerKO`, `startKOSurvivalTalent`) |
| réduit les dégâts reçus | aucun talent ne le fait encore ; la logique de réduction existante est dans `hit-opponent-pokemon.ts` (chercher « Réduction de dégâts », à deux endroits : cible active et banc) |

> 🔎 Pensez à l'accent dans « Réduction » lors de la recherche (`Ctrl + F`).

### 4. Ajouter un Dresseur

Même démarche que pour un Pokémon :

1. Créez la carte dans `data/trainers/`
2. Exportez-la dans `data/trainers/index.ts`
3. Ajoutez-la à la liste `ALL_TRAINER_CARDS`

Si la carte utilise un effet qui n'existe pas encore, ajoutez-le d'abord dans `types/cards.ts`, puis écrivez sa logique dans `rules/` ou dans le bon fichier de `hooks/`. TypeScript vous indiquera ce qui manque.

---

## Vérifier ses modifications

Après chaque changement, lancez :

```bash
npx tsc --noEmit
```

Cette commande vérifie les types sans rien générer. Si elle ne renvoie aucune erreur, vos modifications sont cohérentes avec le reste du code.

## Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [LICENSE](LICENSE).

> Pokémon et ses personnages sont des marques déposées de Nintendo, Game Freak et The Pokémon Company. Ce projet est un projet de fan, non officiel et sans but lucratif.
