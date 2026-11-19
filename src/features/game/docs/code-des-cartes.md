# Code des cartes (étapes 1, 2 et 3)

Le même code marche pour les **attaques**, les **talents** et les **cartes Dresseur**.
Il s'écrit dans `script: [ ... ]` : une liste de **blocs**, appliqués dans l'ordre.

Les anciens effets (`effects`, `effect: 'heal30'`…) marchent toujours : le code s'ajoute à côté.

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
| Dégâts / marqueurs (10 = 1 marqueur, ni faiblesse ni résistance, peut mettre K.O.) | `action: 'damage', amount: 20` |
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
| Un Pokémon choisi en cliquant | `who: 'chosen'` (par défaut) |
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
| Déplacement d'un Pokémon | `action: 'switch'` : `target` = le Pokémon, puis on clique sur la case d'arrivée (vide : il s'y pose ; occupée : ils échangent) |
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
- `switch` : toujours dans le camp du Pokémon déplacé ; `to: { filter: { position: 'active' } }` = seulement vers l'avant (`'bench'` = vers l'arrière).

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
{ action: 'damage', amount: 10, per: { count: 'discard', cards: { category: ['supporter'] } },
  target: { side: 'opponent', who: 'active' } },
```

(Les anciens effets `damagePerOpponentDiscardCard` / `damagePerOwnDiscardCard` dans `effects` marchent aussi.)

## À venir

Dis-moi les variables que tu veux ajouter : elles se rangent dans le même format (`action`, `target`, contraintes).
