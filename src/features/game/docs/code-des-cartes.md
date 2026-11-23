# Code des cartes (étapes 1, 2 et 3)

Le même code marche pour les **attaques**, les **talents** et les **cartes Dresseur**.
Il s'écrit dans `script: [ ... ]` : une liste de **blocs**, appliqués dans l'ordre.

Les anciens effets (`effects`, `effect: 'heal30'`…) marchent toujours : le code s'ajoute à côté.

## ⭐ Tout se combine : le modèle d'un bloc

Chaque bloc accepte **toutes** ces options en même temps. Une contrainte (`filter`) marche **partout** où il y a des Pokémon :
dans `target`, `to`, `per`, `if` et `from`. Tu n'as besoin de moi que pour une **nouvelle** variable, jamais pour en combiner.

```ts
{
  action: '…',            // CE QUI SE PASSE (liste des actions plus bas)
  amount: 20,             // combien
  per: { … },             // … pour chaque X (multiplie amount)
  if: { … },              // … seulement si Y (ou une liste : [ {…}, {…} ] = toutes vraies)
  target: { side, who, count, filter },   // QUI le reçoit
  to: { side, who, filter },              // OÙ ça arrive (déplacements)
  coin: { count, need, useLastFlip },     // pièces
  optional: true,         // OUI / NON
  duration: '…',          // COMBIEN DE TEMPS (effets qui durent)
  from: { … },            // CONTRE QUI (résistance, immunité, riposte)
  energyType, conditions, prevent, against, attackName, chooseAttack, cards, pokemon, pokemonName, script, …
}
```

Ordre de traitement d'un bloc : **if → OUI/NON → pièces → per → cibles → destination → effet**.

**Toutes les actions** (détails plus bas) :
`damage`, `counters`, `heal`, `attachEnergy`, `discardEnergy`, `condition`, `removeConditions`,
`retreatCost`, `maxHp`, `resistance`, `boost`, `immunity`, `prevent`, `whenDamaged`,
`switch`, `moveEnergy`, `moveDamage`, `summon`, `returnToHand`, `discardTool`, `returnTool`, `recoverCards`,
`blockAttack`, `attackDamage`, `attackFails`, `attackIgnoresReductions`,
`poisonDamage`, `burnDamage`, `retreatDespiteConditions`, `whenPlayed`, `swapDamage`, `endTurn`.

**Tout ce qu'on peut compter** (`per` et `if`) : `discard`, `discardEnergy`, `hand`, `pokemon`, `energy`, `damageCounters`, `tools`, `retreatCost`, `conditions`, `damageDealt`, `knockedOut`.

### Dégâts ou marqueurs ?

| | `damage` | `counters` | `attackDamage` |
|---|---|---|---|
| `amount` | dégâts | nombre de marqueurs (×10) | dégâts |
| Quand | après l'attaque | après l'attaque | avec l'attaque |
| Résistance, talents qui réduisent les dégâts, immunités | oui (si ça vient d'un Pokémon adverse) | non, rien ne les réduit | oui |
| Cible | n'importe laquelle (`target`) | n'importe laquelle (`target`) | le Pokémon que vise l'attaque |

### Poison plus fort (`poisonCounters`)

Sur un bloc `condition` avec `'poison'`, `poisonCounters` = nombre de marqueurs posés à chaque fin de tour (1 par défaut) :

```ts
// L'actif adverse est Empoisonné : 10 marqueurs (100 dégâts) à chaque fin de tour au lieu d'1.
{ action: 'condition', conditions: ['poison'], poisonCounters: 10, target: { side: 'opponent', who: 'active' } }
```

### `if` : « si … »

`if` compte exactement comme `per` (mêmes `count`, `side`, `who`, `filter`, `cards`, `energyType`) puis compare :

| Écriture | Sens |
|---|---|
| `if: { count: 'pokemon', side: 'opponent', who: 'active', filter: { conditions: ['poison'] } }` | si l'actif adverse est Empoisonné (au moins 1) |
| `if: { count: 'energy', who: 'self', energyType: 'eau', min: 4 }` | si ce Pokémon a au moins 4 Énergies Eau |
| `if: { count: 'discard', side: 'opponent', cards: { category: ['supporter'] }, max: 0 }` | si l'adversaire n'a AUCUN Supporter dans sa défausse |
| `if: { count: 'pokemon', filter: { pokemonTypes: ['feu'] }, min: 2, max: 3 }` | si vous avez 2 ou 3 Pokémon Feu en jeu |
| `if: [ {…}, {…} ]` | si les DEUX sont vraies |
| `if: { count: 'energy', who: 'self', sameAs: { count: 'energy', side: 'opponent', who: 'active' } }` | si ce Pokémon a AUTANT d'Énergies que l'actif adverse |
| `moreThan: {…}` / `lessThan: {…}` / `atLeast: {…}` / `atMost: {…}` | PLUS que / MOINS que / au moins autant / au plus autant qu'un autre compte |

```ts
// 50 dégâts ; +80 si ce Pokémon et l'actif adverse ont le même nombre d'Énergies attachées
damage: 50,
script: [
  { action: 'attackDamage', amount: 80,
    if: { count: 'energy', who: 'self', sameAs: { count: 'energy', side: 'opponent', who: 'active' } } },
],
```

### Pièces : face, pile, « sinon »

| Écriture | Sens |
|---|---|
| `coin: { count: 1 }` | si FACE |
| `coin: { count: 1, need: 'tails' }` | si PILE |
| `coin: { count: 3, need: 'allFace' }` / `'allTails'` | si que des FACE / que des PILE |
| `coin: { count: 3, need: 'perFace' }` / `'perTails'` | amount × nombre de FACE / de PILE |
| `coin: { need: 'tails', useLastFlip: true }` | **sinon** : reprend le lancer du bloc d'avant (pas de nouveau lancer) |

```ts
// « Lancez une pièce. Si c'est face, l'actif adverse est Paralysé. Si c'est pile, ce Pokémon s'inflige 20 dégâts. »
script: [
  { action: 'condition', conditions: ['paralyze'], target: { side: 'opponent', who: 'active' }, coin: { count: 1 } },
  { action: 'damage', amount: 20, target: { who: 'self' }, coin: { need: 'tails', useLastFlip: true } },
],
```

### Toutes les contraintes de `filter`

| Contrainte | Code |
|---|---|
| Type | `pokemonTypes: ['feu', 'eau']` |
| Nom (début) | `pokemonNames: ['Pikachu']` |
| Stade | `stages: ['base', 'niveau1', 'niveau2', 'mega_ex']` |
| GX / EX | `variants: ['gx', 'ex']` |
| Actif / banc | `position: 'active'` ou `'bench'` |
| Blessé | `damaged: true` |
| PV restants | `hpAtMost: 50`, `hpAtLeast: 100` |
| PV max | `maxHpAtMost: 60`, `maxHpAtLeast: 200` |
| Énergies | `hasEnergy: true`, `hasEnergyType: 'feu'`, `hasAnyEnergyType: ['feu', 'eau']`, `energiesAtLeast: 2`, `energiesAtMost: 0` |
| États spéciaux | `conditions: ['poison', 'burn']`, `hasCondition: true` / `false` |
| Outil | `hasTool: true` / `false` |
| Invocation | `isInvocation: true` / `false` |
| A un talent | `hasTalent: true` / `false` |
| Pas lui-même | `excludeSelf: true` |

### Les seules limites

- `attackDamage` : seulement dans une **attaque**, sans pièce ni OUI/NON (calculé avant la frappe) ; `per` et `if` marchent.
- Talents **passifs** : seulement les effets qui durent ; leurs `if` / `per` voient le plateau, pas la main ni la défausse.
- `whenDamaged` ne se déclenche pas encore avec les attaques où l'on choisit librement le Pokémon adverse.

## Où l'écrire

```ts
// Attaque : le script s'applique APRÈS les dégâts de l'attaque
{ name: 'Mon attaque', damage: 30, energyCost: 2, script: [ /* blocs */ ] }

// Talent : bouton « Utiliser le talent », une seule fois par tour
talent: { name: 'Mon talent', type: 'activated', effect: 'script', description: '…', script: [ /* blocs */ ] }

// Talent PASSIF (étape 2) : toujours actif tant que le Pokémon est en jeu
// (seulement les effets qui durent : retreatCost, maxHp, resistance, boost, immunity, prevent, whenDamaged)
talent: { name: 'Mon talent', type: 'passive', effect: 'script', description: '…', script: [ /* blocs */ ] }

// Carte Dresseur (Objet ou Supporter) : « Activer », la carte part à la défausse puis le script s'applique
{ id: '…', name: '…', category: 'objet', description: '…', effect: 'script', script: [ /* blocs */ ] }
```

## Un bloc

```ts
{
  action: 'heal',          // ce qui se passe (liste plus bas)
  amount: 30,              // combien
  target: { ... },         // qui le reçoit (plus bas)
  coin: { ... },           // lancer de pièces (facultatif)
  optional: true,          // panneau OUI / NON (facultatif)
}
```

## Les actions (`action`)

| Variable | Code |
|---|---|
| Soin / PV | `action: 'heal', amount: 30` |
| Dégâts (réduits par les résistances, talents de réduction et immunités de la cible) | `action: 'damage', amount: 20` |
| Marqueurs de dégâts, comme Errance Nocturne de Téraclope (`amount` = nombre de marqueurs ; RIEN ne les réduit) | `action: 'counters', amount: 2` (= 20 dégâts) |
| Ajouter des Énergies | `action: 'attachEnergy', amount: 2, energyType: 'feu'` (sans `energyType` : le type du Pokémon) |
| Perte / défausse d'Énergies | `action: 'discardEnergy', amount: 1, energyType: 'eau'` (`amount: 99` = toutes) |
| Effets spéciaux (états) | `action: 'condition', conditions: ['poison', 'burn']` (`poison`, `burn`, `paralyze`, `sleep`, `confuse`) |
| Guérir les états spéciaux | `action: 'removeConditions'` |

## Qui reçoit l'effet (`target`)

| Variable | Code |
|---|---|
| Ses Pokémon | `side: 'own'` (par défaut pour heal, attachEnergy, removeConditions) |
| Pokémon adverses | `side: 'opponent'` (par défaut pour damage, discardEnergy, condition) |
| Les deux camps | `side: 'both'` |
| Soi-même (le Pokémon qui attaque / qui a le talent) | `who: 'self'` |
| Le Pokémon actif (celui de la colonne) | `who: 'active'` |
| Un Pokémon choisi en cliquant | `who: 'chosen'` (par défaut). Avec `damage`, `counters` ou `condition` (sans `filter`), on peut aussi cliquer sur le **joueur** adverse ; `target: { includePlayer: false }` pour l'interdire |
| Plusieurs Pokémon choisis | `who: 'chosen', count: 2` |
| Tous les Pokémon | `who: 'all'` |
| Le joueur | `who: 'player'` (dégâts, Poison et Brûlure, `prevent` Objets / Supporters ; jamais soigné) |
| Le Pokémon qui vient d'attaquer (étape 2, seulement dans un `whenDamaged`) | `who: 'attacker'` |

## Contraintes (`target.filter`)

Toutes facultatives, elles s'additionnent.

| Variable | Code |
|---|---|
| Type du Pokémon | `filter: { pokemonTypes: ['eau'] }` |
| Un certain Pokémon | `filter: { pokemonNames: ['Carchacrok'] }` (début du nom) |
| Stade | `filter: { stages: ['base'] }` |
| GX / EX | `filter: { variants: ['gx', 'ex'] }` |
| Pokémon blessé | `filter: { damaged: true }` |
| Avec un état spécial | `filter: { conditions: ['poison', 'burn'] }` ou `filter: { hasCondition: true }` |
| Avec au moins une Énergie | `filter: { hasEnergy: true }` |
| Avec une Énergie d'un type | `filter: { hasEnergyType: 'plante' }` |
| Seulement l'actif / seulement le banc | `filter: { position: 'active' }` / `filter: { position: 'bench' }` |
| Jamais lui-même | `filter: { excludeSelf: true }` |

## Lancer de pièces (`coin`)

Avec le compteur de pièces du Pokémon (ou de la carte Dresseur).

| Variable | Code |
|---|---|
| 1 pièce, FACE = l'effet s'applique | `coin: { count: 1 }` |
| Que des FACE | `coin: { count: 2, need: 'allFace' }` |
| X par FACE | `coin: { count: 3, need: 'perFace' }` (`amount` × nombre de FACE) |

## Choix d'appliquer l'effet (`optional`)

| Variable | Code |
|---|---|
| Panneau OUI / NON | `optional: true` |
| Avec ta question | `optional: 'Soigner 30 dégâts à un Pokémon Eau ?'` |

## Exemples

```ts
// « Soignez 30 dégâts à l'un de vos Pokémon Eau » avec OUI / NON et une pièce
script: [
  {
    action: 'heal',
    amount: 30,
    target: { side: 'own', who: 'chosen', filter: { pokemonTypes: ['eau'] } },
    coin: { count: 1 },
    optional: true,
  },
],

// « Lancez 3 pièces. 20 dégâts au Pokémon actif adverse par FACE, puis il est Empoisonné »
script: [
  { action: 'damage', amount: 20, target: { side: 'opponent', who: 'active' }, coin: { count: 3, need: 'perFace' } },
  { action: 'condition', conditions: ['poison'], target: { side: 'opponent', who: 'active' } },
],

// « Ce Pokémon s'inflige 30 dégâts »
script: [{ action: 'damage', amount: 30, target: { who: 'self' } }],

// « Attachez 1 Énergie Feu à 2 de vos Pokémon Feu de banc »
script: [
  { action: 'attachEnergy', amount: 1, energyType: 'feu',
    target: { side: 'own', who: 'chosen', count: 2, filter: { pokemonTypes: ['feu'], position: 'bench' } } },
],
```

## Étape 2 : les effets qui DURENT

Ces actions ne font rien tout de suite : elles posent un **effet** sur le Pokémon (ou le joueur)
pour une certaine **durée**. Les effets en cours s'affichent dans le panneau du Pokémon (✨, ou ⏳ s'il commence plus tard).

| Variable | Code |
|---|---|
| Baisser le coût de retraite | `action: 'retreatCost', amount: -1` (par défaut : ses Pokémon) |
| Ajouter au coût de retraite | `action: 'retreatCost', amount: 1` (par défaut : Pokémon adverses) |
| PV max | `action: 'maxHp', amount: 30` (ou `-30`). Les dégâts déjà subis restent. |
| Résistance (subit moins de dégâts des attaques) | `action: 'resistance', amount: 30` (`-30` = subit 30 dégâts de PLUS) |
| Boost (ses attaques font plus de dégâts) | `action: 'boost', amount: 30` (`-30` = moins), `attackName: 'Lance-Flammes'` = une seule attaque |
| Boost seulement contre certains Pokémon | `action: 'boost', amount: 30, vs: { variants: ['gx', 'ex'] }` (`vs` = mêmes contraintes que `filter`) |
| Immunité | `action: 'immunity', against: ['damage']` (voir plus bas) |
| Empêcher | `action: 'prevent', prevent: ['attack']` (voir plus bas) |
| Si ce Pokémon subit des dégâts | `action: 'whenDamaged', script: [ /* blocs */ ]` (voir plus bas) |

### Durée (`duration`)

| Variable | Code |
|---|---|
| Ce tour | `duration: 'thisTurn'` (par défaut pour `boost`) |
| Jusqu'à la fin du prochain tour adverse | `duration: 'opponentNextTurn'` (par défaut pour les autres) |
| Pendant notre prochain tour | `duration: 'ownNextTurn'` |
| Pendant le tour suivant | `duration: 'nextTurn'` |
| Tant que le Pokémon est en jeu | `duration: 'whileInPlay'` |

Un effet disparaît aussi quand le Pokémon quitte le plateau. Les talents passifs n'ont pas besoin de `duration`.

### Immunités (`against`)

| Variable | Code |
|---|---|
| Dégâts des attaques adverses | `against: ['damage']` (par défaut) |
| Effets des attaques adverses (états, Énergies défaussées…) | `against: ['effects']` |
| Tous les états spéciaux | `against: ['conditions']` |
| Un état précis | `against: ['poison']`, `['burn']`, `['paralyze']`, `['sleep']`, `['confuse']` |
| Dégâts ET effets | `against: ['damage', 'effects']` |

### Empêcher (`prevent`)

| Variable | Code |
|---|---|
| Attaquer | `prevent: ['attack']` |
| Battre en retraite | `prevent: ['retreat']` |
| Utiliser son talent (le talent ne marche plus) | `prevent: ['talent']` |
| Être soigné | `prevent: ['heal']` |
| Recevoir des Énergies de la main (et l'Énergie de fin de tour) | `prevent: ['energy']` |
| Jouer des Objets (avec `who: 'player'`) | `prevent: ['items']` |
| Jouer des Supporters (avec `who: 'player'`) | `prevent: ['supporters']` |
| Jouer des Outils seulement (avec `who: 'player'`) | `prevent: ['tools']` |

### Seulement contre certains attaquants (`from`)

Pour `resistance`, `immunity` et `whenDamaged`, `from` reprend les contraintes de `filter` (type, nom, stade, GX/EX, Énergies…)
et les applique au **Pokémon qui attaque** :

```ts
{ action: 'immunity', against: ['damage'], from: { variants: ['gx', 'ex'] }, target: { who: 'self' } }
```

### Si ce Pokémon subit des dégâts (`whenDamaged`)

Quand le Pokémon perd des PV à cause d'une attaque adverse, son `script` se lance
(le joueur qui possède ce Pokémon fait les choix). Dans ce script, `who: 'attacker'` = le Pokémon qui a attaqué.
Ne marche pas encore pour les attaques où l'on choisit librement le Pokémon adverse.

```ts
{ action: 'whenDamaged', duration: 'opponentNextTurn', target: { who: 'self' },
  script: [ { action: 'damage', amount: 20, target: { who: 'attacker' } } ] }
```

### Exemples de l'étape 2

```ts
// Attaque : « Pendant le prochain tour de votre adversaire, ce Pokémon subit 30 dégâts de moins. »
script: [ { action: 'resistance', amount: 30, target: { who: 'self' } } ],

// Attaque : « Pendant le prochain tour de votre adversaire, le Pokémon Défenseur ne peut pas attaquer ni battre en retraite. »
script: [ { action: 'prevent', prevent: ['attack', 'retreat'], target: { side: 'opponent', who: 'active' } } ],

// Attaque : « Pendant votre prochain tour, les attaques de ce Pokémon infligent 40 dégâts de plus. »
script: [ { action: 'boost', amount: 40, duration: 'ownNextTurn', target: { who: 'self' } } ],

// Dresseur : « Pendant ce tour, le coût de retraite de votre Pokémon actif est réduit de 2. »
script: [ { action: 'retreatCost', amount: -2, duration: 'thisTurn', target: { side: 'own', who: 'active' } } ],

// Attaque : « Votre adversaire ne peut pas jouer de carte Objet pendant son prochain tour. »
script: [ { action: 'prevent', prevent: ['items'], target: { side: 'opponent', who: 'player' } } ],

// Talent passif : « Vos Pokémon Eau ont +20 PV et ne peuvent pas être Endormis. »
talent: { name: 'Source', type: 'passive', effect: 'script', description: '…', script: [
  { action: 'maxHp', amount: 20, target: { side: 'own', who: 'all', filter: { pokemonTypes: ['eau'] } } },
  { action: 'immunity', against: ['sleep'], target: { side: 'own', who: 'all', filter: { pokemonTypes: ['eau'] } } },
] },

// Talent passif : « Si ce Pokémon est actif et subit les dégâts d'une attaque, le Pokémon attaquant est Brûlé. »
talent: { name: 'Corps Ardent', type: 'passive', effect: 'script', description: '…', script: [
  { action: 'whenDamaged', target: { who: 'self', filter: { position: 'active' } },
    script: [ { action: 'condition', conditions: ['burn'], target: { who: 'attacker' } } ] },
] },

// Talent passif : « Tant que ce Pokémon est en jeu, votre adversaire ne peut pas jouer de Supporter. »
talent: { name: 'Intimidation', type: 'passive', effect: 'script', description: '…', script: [
  { action: 'prevent', prevent: ['supporters'], target: { side: 'opponent', who: 'player' } },
] },
```

## Étape 3 : déplacer, faire apparaître, main, défausse, outils

| Variable | Code |
|---|---|
| Déplacement d'un Pokémon | `action: 'switch'` : `target` = le Pokémon, puis on clique sur le Pokémon avec qui il échange (`to: { emptyCells: true }` : une case vide est aussi possible) |
| Déplacement d'Énergies | `action: 'moveEnergy', amount: 1, energyType: 'feu'` : de `target` vers `to` (`amount: 99` = toutes) |
| Déplacement de marqueurs (dégâts) | `action: 'moveDamage', amount: 20` : de `target` vers `to` (10 = 1 marqueur, `99` = tous) |
| Apparition / invocation | `action: 'summon', pokemonName: 'Ouisticram'` : sur une case vide de la ligne de jeu (B1-B4 / C1-C4), comme les autres Invocations (`invocation: false` = Pokémon normal, `amount: 1` = avec 1 Énergie) |
| Invoquer un Pokémon AU CHOIX | `action: 'summon', pokemon: { maxHp: 60 }` : le Pokémon est choisi à la **préparation de la partie**, comme avant |
| Reprendre en main (un Pokémon) | `action: 'returnToHand'` (son Outil aussi ; ses Énergies vont à la défausse ; une Invocation disparaît) |
| Défausser un Outil | `action: 'discardTool'` (par défaut : Pokémon adverses) |
| Reprendre un Outil en main | `action: 'returnTool'` |
| Pile de défausse → main | `action: 'recoverCards', amount: 2, cards: { category: ['supporter'] }` (un panneau propose les cartes, bouton « Terminer ») |
| Pile de défausse → Énergies | `action: 'attachEnergy', fromDiscard: true, amount: 2, energyType: 'eau'` |

### La destination (`to`)

Pour `switch`, `moveEnergy` et `moveDamage`, `target` = **d'où ça part** et `to` = **où ça arrive**.
`to` s'écrit comme `target` (`side`, `who`, `filter`) :

- `moveEnergy` : par défaut vers **un de vos Pokémon** choisi ;
- `moveDamage` : par défaut vers **un Pokémon adverse** choisi ;
- `switch` : échange toujours avec un autre Pokémon du même camp ; `to: { emptyCells: true }` = peut aussi aller sur une case vide ; `to: { filter: { position: 'active' } }` = seulement vers l'avant (`'bench'` = vers l'arrière).

Avec `to: { who: 'self' }`, `to: { who: 'active' }` ou `to: { who: 'attacker' }`, la destination est choisie toute seule.

### Pokémon au choix pour `summon` (`pokemon`)

Comme pour les anciennes Invocations (Plumeline, Fan Club…), le choix se fait à la **préparation de la partie** :
après avoir validé son deck, chaque carte (attaque, talent ou Dresseur) qui contient un `summon` avec `pokemon`
demande de choisir ses Invocations parmi les Pokémon **de la série de la partie** qui respectent les contraintes.
On en choisit autant que `target.count` (1 par défaut). En jeu, la carte invoque ces Pokémon : on clique seulement sur les cases vides.

| Variable | Code |
|---|---|
| PV au plus / au moins | `pokemon: { maxHp: 60 }`, `pokemon: { minHp: 100 }` |
| Type | `pokemon: { pokemonTypes: ['feu'] }` |
| Stade | `pokemon: { stages: ['niveau1'] }` (sans `stages` : Pokémon de Base) |
| GX / EX | `pokemon: { variants: ['gx', 'ex'] }` |
| Début du nom | `pokemon: { names: ['Évoli'] }` |

Une carte ne peut avoir qu'**un seul** `summon` avec `pokemon` (le premier trouvé).

### Cartes de la défausse (`cards`)

| Variable | Code |
|---|---|
| Supporters | `cards: { category: ['supporter'] }` |
| Objets (Outils compris) | `cards: { category: ['objet'] }` |
| Outils | `cards: { category: ['outil'] }` |
| Pokémon | `cards: { category: ['pokemon'] }` |
| Pokémon d'un type / stade / GX-EX | `cards: { pokemonTypes: ['feu'], stages: ['base'], variants: ['gx'] }` |
| Une carte précise | `cards: { names: ['Potion'] }` |

### Exemples de l'étape 3

```ts
// Talent : « Une fois par tour, vous pouvez échanger ce Pokémon avec un de vos Pokémon de banc. »
script: [ { action: 'switch', target: { who: 'self' }, to: { filter: { position: 'bench' } } } ],

// Dresseur (Guzma) : « Échangez le Pokémon actif de votre adversaire avec un de ses Pokémon de banc. »
script: [ { action: 'switch', target: { side: 'opponent', who: 'chosen', filter: { position: 'active' } },
            to: { filter: { position: 'bench' } } } ],

// Attaque : « Échangez un Pokémon de banc de votre adversaire avec son Pokémon actif. 30 dégâts au nouveau Pokémon actif. »
script: [
  { action: 'switch', target: { side: 'opponent', who: 'active' },
    to: { filter: { position: 'bench' } } },
  { action: 'damage', amount: 30, target: { side: 'opponent', who: 'active' } },
],

// Attaque : « Déplacez toutes les Énergies Eau de vos Pokémon de banc vers ce Pokémon. »
script: [ { action: 'moveEnergy', amount: 99, energyType: 'eau',
            target: { side: 'own', who: 'all', filter: { position: 'bench' } }, to: { who: 'self' } } ],

// Talent : « Une fois par tour, déplacez 2 marqueurs de dégâts d'un de vos Pokémon vers le Pokémon actif adverse. »
script: [ { action: 'moveDamage', amount: 20, target: { side: 'own', who: 'chosen' },
            to: { side: 'opponent', who: 'chosen', filter: { position: 'active' } } } ],

// Supporter Fan Club Pokémon : « Invoquez 2 Pokémon de Base ayant 60 PV ou moins sur votre banc. »
effect: 'script',
script: [ { action: 'summon', pokemon: { maxHp: 60 },
            target: { side: 'own', count: 2 } } ],

// Attaque : « Invoquez 2 Ouisticram. »
script: [ { action: 'summon', pokemonName: 'Ouisticram', target: { count: 2 } } ],

// Attaque : « Pile : le Pokémon Défenseur retourne dans la main de votre adversaire. »
script: [ { action: 'returnToHand', target: { side: 'opponent', who: 'active' }, coin: { count: 1 } } ],

// Dresseur : « Défaussez un Outil attaché à un Pokémon de votre adversaire. »
script: [ { action: 'discardTool', target: { side: 'opponent', who: 'chosen' } } ],

// Dresseur : « Reprenez 2 cartes Supporter de votre pile de défausse dans votre main. »
script: [ { action: 'recoverCards', amount: 2, cards: { category: ['supporter'] } } ],

// Attaque : « Attachez 2 Énergies Feu de votre pile de défausse à vos Pokémon de banc. »
script: [ { action: 'attachEnergy', fromDiscard: true, amount: 1, energyType: 'feu',
            target: { side: 'own', who: 'chosen', count: 2, filter: { position: 'bench' } } } ],
```

## Combiner les variables : « pour chaque … » (`per`) et dégâts de l'attaque

### `per` : pour chaque …

`per` marche sur **n'importe quel bloc** qui a un `amount` (dégâts, soin, Énergies, boost, résistance, marqueurs…) :
`amount` est multiplié par le nombre compté. Le camp (`side`) est compté depuis le joueur qui joue la carte.

| Variable | Code |
|---|---|
| Cartes de la pile de défausse | `per: { count: 'discard', side: 'opponent', cards: { category: ['objet'] } }` |
| Énergies de la pile de défausse | `per: { count: 'discardEnergy', energyType: 'feu' }` |
| Cartes de la main | `per: { count: 'hand', side: 'opponent', cards: { category: ['supporter'] } }` |
| Pokémon en jeu (plateau) | `per: { count: 'pokemon', filter: { pokemonTypes: ['eau'] } }` |
| Énergies attachées | `per: { count: 'energy', side: 'opponent', who: 'active' }` (`energyType` possible) |
| Marqueurs de dégâts | `per: { count: 'damageCounters', who: 'self' }` |
| Outils attachés | `per: { count: 'tools', side: 'both' }` |

`side` : `'own'` (par défaut), `'opponent'`, `'both'`. `who` : `'all'` (par défaut), `'self'` (ce Pokémon), `'active'` (l'actif de sa colonne).
`filter` et `cards` s'écrivent comme d'habitude. Si le compte vaut 0, le bloc ne fait rien.

### `attackDamage` : dégâts en plus pour l'attaque

Seulement dans le `script` d'une **attaque** : ces dégâts s'ajoutent aux dégâts de l'attaque **avant** qu'elle frappe
(ils comptent dans l'affichage, avec résistances et réductions).

```ts
{ action: 'attackDamage', amount: 20, per: { count: 'discard', side: 'opponent', cards: { category: ['objet'] } } }
```

### Empêcher une attaque au choix

`prevent: ['attack']` + `chooseAttack: true` : un panneau propose les attaques du Pokémon ciblé, seule celle choisie est bloquée.
Avec `attackName: 'Lance-Flammes'` à la place, c'est toujours cette attaque. (`action: 'blockAttack'` est un raccourci.)

### Conditions (« si … ») avec `per`

Pour un bonus **seulement si** quelque chose est vrai, on compte le Pokémon concerné avec un `filter` :
le compte vaut 1 (vrai) ou 0 (faux, le bloc ne fait rien).

```ts
// +80 dégâts si l'actif adverse est Empoisonné ou Brûlé
{ action: 'attackDamage', amount: 80,
  per: { count: 'pokemon', side: 'opponent', who: 'active', filter: { conditions: ['poison', 'burn'] } } },

// Soignez 30 dégâts à ce Pokémon si l'actif adverse a un état spécial (n'importe lequel)
{ action: 'heal', amount: 30, target: { who: 'self' },
  per: { count: 'pokemon', side: 'opponent', who: 'active', filter: { hasCondition: true } } },
```

Contraintes d'états spéciaux (dans n'importe quel `filter`) : `conditions: ['poison', 'burn', 'paralyze', 'sleep', 'confuse']`
(au moins un de ceux-là), `hasCondition: true` (n'importe lequel) ou `hasCondition: false` (aucun).

### Exemple complet

« Choisissez une des attaques du Pokémon actif de votre adversaire : il ne pourra pas l'utiliser pendant son prochain tour.
Cette attaque inflige 20 dégâts supplémentaires pour chaque carte Objet dans la pile de défausse de votre adversaire. »

```ts
script: [
  { action: 'attackDamage', amount: 20,
    per: { count: 'discard', side: 'opponent', cards: { category: ['objet'] } } },
  { action: 'prevent', prevent: ['attack'], chooseAttack: true,
    target: { side: 'opponent', who: 'active' }, duration: 'opponentNextTurn' },
],
```

### Autres combinaisons

```ts
// +10 dégâts par marqueur de dégâts sur ce Pokémon
{ action: 'attackDamage', amount: 10, per: { count: 'damageCounters', who: 'self' } },

// +20 dégâts par Énergie attachée à l'actif adverse
{ action: 'attackDamage', amount: 20, per: { count: 'energy', side: 'opponent', who: 'active' } },

// Soignez 10 dégâts à chacun de vos Pokémon pour chaque Pokémon Eau en jeu
{ action: 'heal', amount: 10, per: { count: 'pokemon', filter: { pokemonTypes: ['eau'] } },
  target: { side: 'own', who: 'all' } },

// Pile : pendant le prochain tour adverse, ce Pokémon subit 10 dégâts de moins par Énergie Métal attachée
{ action: 'resistance', amount: 10, per: { count: 'energy', who: 'self', energyType: 'metal' },
  target: { who: 'self' }, coin: { count: 1 } },

// Placez 1 marqueur sur l'actif adverse pour chaque Supporter dans votre défausse
{ action: 'counters', amount: 1, per: { count: 'discard', cards: { category: ['supporter'] } },
  target: { side: 'opponent', who: 'active' } },
```

(Les anciens effets `damagePerOpponentDiscardCard` / `damagePerOwnDiscardCard` dans `effects` marchent aussi.)

## Variables ajoutées pour couvrir tous les effets du jeu

| Variable | Code |
|---|---|
| L'attaque ne fait rien (si …) | `{ action: 'attackFails', if: { … } }` (vérifié avant la frappe) |
| L'attaque ignore résistances et réductions | `{ action: 'attackIgnoresReductions' }` (avec `if` possible) |
| Poison plus fort | `{ action: 'poisonDamage', amount: 20, target: … }` (+20 à chaque fin de tour) |
| Brûlure plus forte | `{ action: 'burnDamage', amount: 40, target: … }` |
| Retraite même Endormi / Paralysé | `{ action: 'retreatDespiteConditions', target: { who: 'self' } }` |
| Quand ce Pokémon est joué (posé, évolué, invoqué) | talent passif : `{ action: 'whenPlayed', target: { who: 'self' }, script: [ … ] }` |
| Échanger les dégâts de deux Pokémon | `{ action: 'swapDamage', target: { who: 'self' }, to: { side: 'opponent', who: 'active' } }` |
| Terminer le tour | `{ action: 'endTurn' }` (à la fin du script) |
| C'est l'adversaire qui choisit | `target: { …, chooser: 'opponent' }` (ou dans `to`) |
| Compter le coût de retraite | `per: { count: 'retreatCost', side: 'opponent', who: 'active' }` |
| Compter les états spéciaux | `per: { count: 'conditions', side: 'opponent', who: 'active' }` |
| Dégâts infligés par cette attaque | `per: { count: 'damageDealt' }` |

### Outils en code

```ts
// Outil Bandeau Choix : « Les attaques du Pokémon auquel cette carte est attachée infligent
//   30 dégâts supplémentaires au Pokémon GX ou EX de votre adversaire. »
script: [ { action: 'boost', amount: 30, vs: { variants: ['gx', 'ex'] }, target: { who: 'self' } } ],
```

Un Outil peut aussi avoir un script : `subtype: 'outil', effect: 'script', script: [ … ]`.
On l'attache comme les autres Outils ; ses blocs agissent **tant qu'il est attaché** (comme un talent passif),
avec `who: 'self'` = le Pokémon qui le porte. `target` (sur la carte, pas dans le script) limite à qui on peut l'attacher.

```ts
// Outil : « Le Pokémon auquel cet Outil est attaché a +40 PV. Ne s'attache qu'aux Pokémon de Niveau 1. »
export const haltere: TrainerCard = {
  id: 'haltere-001', name: 'Haltère', category: 'objet', subtype: 'outil', description: '…',
  target: { stages: ['niveau1'] },
  effect: 'script',
  script: [ { action: 'maxHp', amount: 40, target: { who: 'self' } } ],
};

// Outil : « Coût de retraite -1, et peut battre en retraite même Endormi ou Paralysé. »
script: [
  { action: 'retreatCost', amount: -1, target: { who: 'self' } },
  { action: 'retreatDespiteConditions', target: { who: 'self' } },
],

// Outil : « Si ce Pokémon subit les dégâts d'une attaque, placez 2 marqueurs sur l'attaquant. »
script: [ { action: 'whenDamaged', target: { who: 'self' },
            script: [ { action: 'counters', amount: 2, target: { who: 'attacker' } } ] } ],
```

## Correspondance : anciens effets → code des cartes

Les anciens effets marchent toujours, et peuvent être **mélangés** avec un `script` sur la même attaque.
Voici comment chacun s'écrit avec le code des cartes.

### Attaques (`effects`)

| Ancien effet | Code des cartes |
|---|---|
| heal | `{ action: 'heal', amount: 30, target: { who: 'self' } }` |
| healPokemonByType / healAllOwnPokemon | `{ action: 'heal', amount: 20, target: { side: 'own', who: 'all', filter: { pokemonTypes: ['eau'] } } }` |
| healSelfPerOpponentActiveEnergy | `{ action: 'heal', amount: 10, target: { who: 'self' }, per: { count: 'energy', side: 'opponent', who: 'active' } }` |
| healSelfByDamageDealt | `{ action: 'heal', amount: 1, target: { who: 'self' }, per: { count: 'damageDealt' } }` |
| discardEnergy / discardTypedEnergy | `{ action: 'discardEnergy', amount: 1, energyType: 'feu', target: { who: 'self' } }` |
| discardOpponentActiveEnergy | `{ action: 'discardEnergy', amount: 1, target: { side: 'opponent', who: 'active' } }` |
| discardAllEnergyAndToolsFromBothActives | `discardEnergy` 99 + `discardTool`, `target: { side: 'both', who: 'active' }` |
| recoverEnergy / recoverEnergyToBench | `{ action: 'attachEnergy', fromDiscard: true, target: … }` |
| switchWithBench | `{ action: 'switch', target: { who: 'self' }, to: { filter: { position: 'bench' } } }` |
| recoil / damageOneOwnBenchPokemon / ownBenchDamage | `{ action: 'damage' (ou 'counters'), target: { who: 'self' } }` / `{ side: 'own', who: 'chosen', filter: { position: 'bench' } }` |
| selfDamageEqualToDamageTaken | `{ action: 'counters', amount: 1, target: { who: 'self' }, per: { count: 'damageCounters', who: 'self' } }` |
| poison / burn / paralyze / confuse / sleep | `{ action: 'condition', conditions: ['poison'], target: { side: 'opponent', who: 'active' } }` |
| discardAllEnergyForBonus / discardAllTypedEnergyForBonus | `attackDamage` avec `per: { count: 'energy', who: 'self' }` + `discardEnergy` 99 |
| bonusDamagePerTargetRetreatCost | `{ action: 'attackDamage', amount: 20, per: { count: 'retreatCost', side: 'opponent', who: 'active' } }` |
| reduceDamagePerTargetRetreatCost | `{ action: 'resistance', amount: 10, per: { count: 'retreatCost', … }, target: { who: 'self' } }` |
| reduceDamageNextOpponentTurn / takeExtraDamageNextTurn | `{ action: 'resistance', amount: 30 (ou -30), target: { who: 'self' } }` |
| ignoreTargetDamageReduction / fixedDamage | `{ action: 'attackIgnoresReductions' }` |
| setNextTurnAttackBaseDamage | `{ action: 'boost', amount: 60, duration: 'ownNextTurn', attackName: '…', target: { who: 'self' } }` |
| healAllOwnAndReturnSelf / returnSelfToHand | `heal` (all) + `{ action: 'returnToHand', target: { who: 'self' } }` |
| bonusDamage | `{ action: 'attackDamage', amount: 30 }` |
| bonusDamageIfSelfDamaged | `attackDamage` + `if: { count: 'damageCounters', who: 'self' }` |
| bonusDamageIfTargetType / IfTargetGx / IfTargetEvolved / IfTargetNotEvolved | `attackDamage` + `if: { count: 'pokemon', side: 'opponent', who: 'active', filter: { pokemonTypes / variants / stages } }` |
| bonusDamageIfExtraEnergy | `attackDamage` + `if: { count: 'energy', who: 'self', min: coût + X }` |
| bonusDamageIfOpponentHasTypeInPlay | `attackDamage` + `if: { count: 'pokemon', side: 'opponent', filter: { pokemonTypes: ['psy'] } }` |
| bonusDamageIfToolAttached / IfAttachedEnergy / IfDefenderHasEnergy / IfTargetPoisoned / IfOpponentActiveHasCondition | `attackDamage` + `if` avec `filter: { hasTool / hasEnergy / conditions … }` |
| bonusDamagePerOpponentActiveSpecialCondition | `attackDamage` + `per: { count: 'conditions', side: 'opponent', who: 'active' }` |
| damagePerAttachedEnergy / damagePerOpponentActiveEnergy | `attackDamage` + `per: { count: 'energy', … }` |
| damagePerSelfDamageCounter | `attackDamage` + `per: { count: 'damageCounters', who: 'self' }` |
| damagePerAllBenchPokemon / bonusDamagePerOpponentBenchPokemon | `attackDamage` + `per: { count: 'pokemon', side: 'both' (ou 'opponent'), filter: { position: 'bench' } }` |
| damagePerOpponentTrainerInHand / damagePerOwnCardInHand | `attackDamage` + `per: { count: 'hand', … }` |
| damagePerOpponentDiscardCard / bonusDamagePerOwnDiscardCard | `attackDamage` + `per: { count: 'discard', cards: … }` |
| failsIfOpponentActiveMaxHpAtLeast | `{ action: 'attackFails', if: { count: 'pokemon', side: 'opponent', who: 'active', filter: { maxHpAtLeast: 200 } } }` |
| knockOutIfOpponentActiveIsBase | `{ action: 'counters', amount: 99, target: { side: 'opponent', who: 'active', filter: { stages: ['base'] } } }` |
| summonFromAnyDiscard | (ancien effet seulement) |
| discardOpponentActiveTool | `{ action: 'discardTool', target: { side: 'opponent', who: 'active' } }` |
| freeRetreatNextOwnTurn | `{ action: 'retreatCost', amount: -99, duration: 'ownNextTurn', target: { who: 'self' } }` |
| moveCountersFromOwnToOpponentActive | `{ action: 'moveDamage', amount: 99, target: { side: 'own', who: 'chosen' }, to: { side: 'opponent', who: 'active' } }` |
| swapDamageCountersWithOpponentActive | `{ action: 'swapDamage', target: { who: 'self' }, to: { side: 'opponent', who: 'active' } }` |
| reduceTargetAttackDamageNextTurn | `{ action: 'boost', amount: -40, duration: 'opponentNextTurn', target: { side: 'opponent', who: 'active' } }` |
| gatherEnergyFromBench / transferAllEnergiesToBench / attachEnergyToBench / moveOwnEnergyToBench | `moveEnergy` / `attachEnergy` |
| coinCheckBeforeTargetAttackNextTurn | (ancien effet seulement) |
| forceOpponentActiveSwitch | `{ action: 'switch', target: { side: 'opponent', who: 'active', chooser: 'opponent' }, to: { filter: { position: 'bench' } } }` |
| preventAllAttackDamage(AndEffects)NextOpponentTurn | `{ action: 'immunity', against: ['damage'] (+ 'effects'), target: { who: 'self' } }` |
| preventDamageFromStageOrVariantNextOpponentTurn | `immunity` + `from: { stages / variants }` |
| preventOpponentPlayingItemsNextTurn | `{ action: 'prevent', prevent: ['items'], target: { side: 'opponent', who: 'player' } }` |
| preventTargetRetreatNextTurn / blockEnergyAttachmentFromHand / preventTargetHealingNextOpponentTurn | `prevent: ['retreat'] / ['energy'] / ['heal']` |
| blocksNextOwnTurn / blocksAllAttacksNextOwnTurn | `{ action: 'prevent', prevent: ['attack'], attackName: '…' (ou rien), duration: 'ownNextTurn', target: { who: 'self' } }` |
| damageEveryoneIgnoringEffects / damageAllOpponentPokemonAndPlayer | `counters` avec `target: { side: 'both', who: 'all' }` + `who: 'player'` |
| damageAllPokemonWithTalent | `counters` + `target: { side: 'both', who: 'all', filter: { hasTalent: true } }` |
| summonPokemon / summonFromInvocationPool | `summon` (`pokemonName` / `pokemon`) |
| retaliateDamageNextOpponentTurn | `whenDamaged` + `counters` sur `who: 'attacker'` |
| coinCount + coinDamageEffects / damagePerFace / damagePerPile / failsOn | garder ces réglages sur l'attaque (ils se mélangent avec `script`) |

### Talents

| Ancien effet | Code des cartes (talent `type: 'passive', effect: 'script'` sauf mention) |
|---|---|
| blockBaseAttacks | `{ action: 'prevent', prevent: ['attack'], target: { side: 'opponent', who: 'all', filter: { stages: ['base'] } } }` |
| preventDamageFromType / preventAllEffectsFromExGx | `immunity` + `from: { pokemonTypes / variants }` |
| reduceDamageFromFireWater / reduceAllAttackDamage | `resistance` (+ `from`) |
| reduceOpposingColumnAttackDamage | `{ action: 'boost', amount: -30, target: { side: 'opponent', who: 'active' } }` |
| preventDamageToTypeFromToolAttackers | `immunity` + `from: { hasTool: true }`, `target: { side: 'own', who: 'all', filter: { pokemonTypes: ['metal'] } }` |
| freeRetreatForOwnBasePokemon | `{ action: 'retreatCost', amount: -99, target: { side: 'own', who: 'all', filter: { stages: ['base'] } } }` |
| damageOpponentOnPlay / paralyzeOpponentOnPlay / applyConditionsToOpponentOnPlay | `whenPlayed` + `damage` / `condition` |
| gatherEnergyOnPlayThenSwitch | `whenPlayed` + `moveEnergy` + `switch` |
| preventAllAttackDamageAndEffectsOnPlayUntilOpponentTurnEnd | `whenPlayed` + `immunity` (`against: ['damage', 'effects']`) |
| burnAttackerWhenDamagedWhileActive | `whenDamaged` (target self, `position: 'active'`) + `condition` burn sur `attacker` |
| negateOpponentGxExTalents | `{ action: 'prevent', prevent: ['talent'], target: { side: 'opponent', who: 'active', filter: { variants: ['gx', 'ex'] } } }` |
| increaseOpponentPoisonDamage | `{ action: 'poisonDamage', amount: 10, target: { side: 'opponent', who: 'all' } }` |
| increaseOpponentBurnDamage (Simiabraz) | `{ action: 'burnDamage', amount: 40, target: { side: 'opponent', who: 'all' } }` (20 + 40 = 60) |
| attachEnergyOncePerTurn / healOwnPokemonOncePerTurn / healAllOwnPokemonOncePerTurn / moveDamageCounterOncePerTurn / summonOncePerTurn / returnToolToHandOncePerTurn / switchWithBenchOncePerTurn | talent `type: 'activated', effect: 'script'` avec `attachEnergy` / `heal` / `moveDamage` / `summon` / `returnTool` / `switch` |
| surviveKOOnCoin, invertImposedAttackCoinFlipOncePerTurn, freeRetreatOnFirstTurn, swapWithCardFromHand, useBasicPokemonDiscardAttacks, recoverFromDiscardOncePerGame | (anciens effets seulement) |

### Dresseurs

| Ancien effet | Code des cartes |
|---|---|
| heal30 / heal20 / healPokemon / healWaterEnergy50 / healPokemonWithEnergyType | `heal` + `filter` |
| attachEnergy / attach2FireEndTurn | `attachEnergy` (+ `{ action: 'endTurn' }`) |
| returnPokemonToHand / coinReturnPokemonToHand | `returnToHand` (+ `coin`) |
| bothPlayersSwitch / forceOpponentThenSelfSwitch | deux `switch` ; celui de l'adversaire avec `chooser: 'opponent'` |
| summonTwoBase60 | `summon` + `pokemon: { maxHp: 60 }`, `count: 2` |
| boostPokemonAttackThisTurn (Cynthia) | `{ action: 'boost', amount: 100, attackName: '…', duration: 'thisTurn', target: { side: 'own', who: 'all', filter: { pokemonNames: ['…'] } } }` |
| toolHp40 / toolRetreatMinusOneIgnoreConditions | Outil en code (voir plus haut) |
| moveEnergyOnKO | (ancien effet seulement) |

## Pokémon mis K.O. (`count: 'knockedOut'`)

Le jeu garde en mémoire les Pokémon mis K.O. (par une attaque, un Poison, une Brûlure, un effet…).

| Réglage | Sens |
|---|---|
| `side` | `'own'` (vos Pokémon, par défaut), `'opponent'`, `'both'` |
| `turn` | `'last'` (le tour d'avant, par défaut), `'this'` (ce tour-ci), `'both'` |
| `filter` | les contraintes habituelles sur le Pokémon mis K.O. (`isInvocation`, type, stade, GX/EX…) |

```ts
// « Cette attaque inflige 80 dégâts supplémentaires pour chacun de vos Pokémon
//   (hors Invocations) mis K.O. pendant le dernier tour. »
script: [
  { action: 'attackDamage', amount: 80,
    per: { count: 'knockedOut', turn: 'last', filter: { isInvocation: false } } },
],

// « Si un de vos Pokémon a été mis K.O. pendant le dernier tour, … »
if: { count: 'knockedOut' }
```

## Plusieurs types d'Énergie (`energyTypes`)

À la place de `energyType` (un seul type), `energyTypes` accepte une liste : « Psy **ou** Métal ».
Marche avec `attachEnergy` (avec ou sans `fromDiscard`), `discardEnergy` et `moveEnergy`.

```ts
// Talent : « Une fois pendant votre tour, attachez une Énergie Psy ou Métal de votre défausse
//            à l'un de vos Pokémon Psy ou Métal. »
script: [
  { action: 'attachEnergy', fromDiscard: true, amount: 1, energyTypes: ['psy', 'metal'],
    target: { side: 'own', who: 'chosen', filter: { pokemonTypes: ['psy', 'metal'] } } },
],
```

Avec `fromDiscard`, le Pokémon reçoit d'abord une Énergie de **son** type si la défausse en a une
(Psy sur un Pokémon Psy), sinon une autre de la liste. Si la défausse n'a aucune Énergie de la liste,
aucun Pokémon n'est proposé.

## Actif et banc (`position`)

`filter: { position: 'active' }` ou `{ position: 'bench' }` suit les règles du plateau :

| | Actif | Banc |
|---|---|---|
| **Vos** Pokémon | le Pokémon qui attaque / qui a le talent (s'il est devant dans sa colonne) | **tous vos autres** Pokémon |
| Pokémon **adverses** | celui **juste devant** le Pokémon qui attaque / qui a le talent | **tous ses autres** Pokémon |
| Carte Dresseur (pas de Pokémon source) | le Pokémon de devant de chaque colonne | ceux qui ont un Pokémon devant eux |

```ts
// « … si des marqueurs de dégâts sont placés sur vos Pokémon de Banc »
if: { count: 'pokemon', side: 'own', filter: { position: 'bench', damaged: true } }

// « Déplacez une Énergie de ce Pokémon vers l'un de vos Pokémon de Banc »
{ action: 'moveEnergy', amount: 1, target: { who: 'self' }, to: { filter: { position: 'bench' } } }
```

Pour un talent passif, le « Pokémon source » est celui qui a le talent
(ex : Machopeur protège tous vos autres Pokémon).

## La même cible que le bloc d'avant (`who: 'previous'`)

Un bloc n'a qu'**une** `action`. Pour faire deux choses au **même** Pokémon, écris deux blocs ;
le deuxième vise `who: 'previous'` (la cible du bloc d'avant, sans la redemander).

```ts
// Potion Max : « Soignez tous les dégâts de l'un de vos Pokémon, mais défaussez-lui toutes ses Énergies. »
script: [
  { action: 'heal', amount: 999, target: { side: 'own', who: 'chosen' } },
  { action: 'discardEnergy', amount: 99, target: { who: 'previous' } },
],
```

Après un `switch`, `who: 'previous'` vise le Pokémon déplacé (à sa nouvelle place).

