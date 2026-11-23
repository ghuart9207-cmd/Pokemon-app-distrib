import type { TrainerCard, TrainerTargetFilter } from './cards';
import type { PokemonInPlay } from './board';
import type { CoinSide } from './coins';
import type { EnergyType, Player, SpecialCondition } from './core';

// =====================================================================
// CODE DES CARTES (« script ») — commun aux attaques, talents et Dresseurs
//
// Un script est une liste de blocs, appliqués dans l'ordre :
//
//   script: [
//     { action: 'heal', amount: 30, target: { side: 'own', who: 'chosen', filter: { pokemonTypes: ['eau'] } } },
//     { action: 'condition', conditions: ['poison'], target: { side: 'opponent', who: 'active' }, coin: { count: 1 } },
//   ]
// =====================================================================

/** Ce que fait un bloc. */
export type ScriptAction =
  // soigne `amount` PV (jamais au-dessus des PV max, jamais les joueurs)
  | 'heal'
  // inflige `amount` dégâts : passent par les résistances, talents de réduction et immunités
  // (quand ils viennent d'un Pokémon adverse), peut mettre K.O.
  | 'damage'
  // place `amount` MARQUEURS de dégâts (1 = 10 dégâts) : rien ne les réduit, peut mettre K.O.
  | 'counters'
  // attache `amount` Énergie(s) `energyType` (par défaut : le type du Pokémon)
  | 'attachEnergy'
  // défausse `amount` Énergie(s) (de type `energyType` si précisé ; 99 = toutes)
  | 'discardEnergy'
  // inflige les états spéciaux `conditions`
  | 'condition'
  // guérit tous les états spéciaux
  | 'removeConditions'
  // ----- ÉTAPE 2 : effets qui DURENT (voir `duration`) -----
  // coût de retraite : `amount` (+1 = plus cher, -1 = moins cher)
  | 'retreatCost'
  // PV max : `amount` (+30 / -30)
  | 'maxHp'
  // subit `amount` dégâts de MOINS des attaques (négatif = de plus) ; `from` = seulement certains attaquants
  | 'resistance'
  // ses attaques infligent `amount` dégâts de PLUS (négatif = de moins) ; `attackName` = une seule attaque
  | 'boost'
  // immunité : `against` (dégâts, effets, états spéciaux) ; `from` = seulement certains attaquants
  | 'immunity'
  // empêche : `prevent` (attaquer, retraite, talent, soin, Énergies de la main, Objets, Supporters)
  | 'prevent'
  // déclencheur : si ce Pokémon subit les dégâts d'une attaque adverse, lance `script`
  // (dans ce script, who: 'attacker' = le Pokémon qui a attaqué)
  | 'whenDamaged'
  // ----- ÉTAPE 3 : déplacer, faire apparaître, main, défausse, outils -----
  // déplace le Pokémon `target` vers la case `to` (case vide : il s'y pose ; Pokémon : ils échangent)
  | 'switch'
  // déplace `amount` Énergie(s) (`energyType` si précisé, 99 = toutes) de `target` vers `to`
  | 'moveEnergy'
  // déplace `amount` dégâts (10 = 1 marqueur, 99 = tous) de `target` vers `to`
  | 'moveDamage'
  // fait apparaître le Pokémon `pokemonName` sur une case vide (`invocation: false` = Pokémon normal)
  | 'summon'
  // remet le Pokémon `target` dans la main de son joueur (avec son Outil ; Énergies à la défausse)
  | 'returnToHand'
  // défausse l'Outil du Pokémon `target`
  | 'discardTool'
  // remet l'Outil du Pokémon `target` dans la main
  | 'returnTool'
  // reprend `amount` carte(s) de SA pile de défausse dans sa main (`cards` = lesquelles)
  | 'recoverCards'
  // on choisit une attaque du Pokémon `target` : il ne peut pas l'utiliser (voir `duration`)
  // (`attackName` = toujours cette attaque, sans choix)
  // = raccourci de { action: 'prevent', prevent: ['attack'], chooseAttack: true }
  | 'blockAttack'
  // dégâts EN PLUS pour l'attaque elle-même (seulement dans le script d'une attaque),
  // comptés avant les dégâts, avec résistance / faiblesse ; souvent avec `per`
  | 'attackDamage'
  // ----- Attaque (vérifiés AVANT la frappe, seulement dans le script d'une attaque) -----
  // l'attaque ne fait rien (avec `if`, ex : si l'actif adverse a 200 PV ou plus)
  | 'attackFails'
  // l'attaque ignore les réductions de dégâts et résistances de la cible (avec `if` possible)
  | 'attackIgnoresReductions'
  // ----- Effets qui durent (suite) -----
  // le Poison de ce Pokémon inflige `amount` dégâts EN PLUS à chaque fin de tour
  | 'poisonDamage'
  // la Brûlure de ce Pokémon inflige `amount` dégâts EN PLUS
  | 'burnDamage'
  // peut battre en retraite même Endormi ou Paralysé
  | 'retreatDespiteConditions'
  // déclencheur : quand ce Pokémon est joué (posé, évolué, invoqué), lance `script`
  // (à mettre dans un talent passif, avec target: { who: 'self' })
  | 'whenPlayed'
  // ----- Divers -----
  // échange les dégâts (marqueurs) de `target` et de `to`
  | 'swapDamage'
  // termine le tour (après la fin du script)
  | 'endTurn';

/**
 * Condition « si … » : on compte comme pour `per`, puis on compare.
 * Ex. « si l'actif adverse est Empoisonné » :
 * { count: 'pokemon', side: 'opponent', who: 'active', filter: { conditions: ['poison'] } }
 * (`min` vaut 1 par défaut ; `max: 0` = « s'il n'y en a AUCUN »)
 */
export type ScriptCondition = ScriptCount & {
  min?: number;
  max?: number;
  // Comparer avec UN AUTRE compte (même écriture que `per`) :
  // sameAs = autant que ; moreThan = plus que ; lessThan = moins que ;
  // atLeast = au moins autant que ; atMost = au plus autant que.
  sameAs?: ScriptCount;
  moreThan?: ScriptCount;
  lessThan?: ScriptCount;
  atLeast?: ScriptCount;
  atMost?: ScriptCount;
};

/**
 * « Pour chaque … » : multiplie `amount` par ce nombre.
 * Le camp (`side`) est relatif au joueur qui joue la carte.
 */
export type ScriptCount = {
  count:
    // cartes de la pile de défausse (`cards` = lesquelles)
    | 'discard'
    // Énergies de la pile de défausse (`energyType` = lesquelles)
    | 'discardEnergy'
    // cartes de la main (`cards` = lesquelles)
    | 'hand'
    // Pokémon en jeu (`who`, `filter` = lesquels)
    | 'pokemon'
    // Énergies attachées (`who`, `filter` = sur quels Pokémon ; `energyType`)
    | 'energy'
    // marqueurs de dégâts (1 marqueur = 10 dégâts) sur les Pokémon (`who`, `filter`)
    | 'damageCounters'
    // Outils attachés aux Pokémon (`who`, `filter`)
    | 'tools'
    // coût de retraite des Pokémon (`who`, `filter`)
    | 'retreatCost'
    // états spéciaux des Pokémon (`who`, `filter`) : 2 si Empoisonné et Brûlé…
    | 'conditions'
    // dégâts infligés par CETTE attaque au Pokémon visé (dans le script d'une attaque)
    | 'damageDealt'
    // Pokémon mis K.O. (`turn` = quel tour, `side`, `filter`)
    | 'knockedOut';
  // 'own' (par défaut), 'opponent' ou 'both'
  side?: 'own' | 'opponent' | 'both';
  // 'all' (par défaut), 'self' (ce Pokémon) ou 'active' (l'actif de la colonne)
  who?: 'self' | 'active' | 'all';
  filter?: ScriptTargetFilter;
  cards?: ScriptCardFilter;
  energyType?: EnergyType;
  // knockedOut : 'this' (ce tour), 'last' (le tour d'avant, par défaut), 'both' (les deux)
  turn?: 'this' | 'last' | 'both';
};

/** Pokémon proposés par `summon` (au choix, dans la série de la partie). */
export type ScriptPokemonFilter = {
  pokemonTypes?: EnergyType[];
  stages?: TrainerTargetFilter['stages'];
  variants?: TrainerTargetFilter['variants'];
  // début du nom
  names?: string[];
  // PV max au plus / au moins
  maxHp?: number;
  minHp?: number;
};

/** Cartes de la défausse que `recoverCards` peut reprendre. */
export type ScriptCardFilter = {
  // 'pokemon', 'objet', 'supporter', 'outil'
  category?: ('pokemon' | 'objet' | 'supporter' | 'outil')[];
  // pour les Pokémon : types, stades, GX / EX
  pokemonTypes?: EnergyType[];
  stages?: TrainerTargetFilter['stages'];
  variants?: TrainerTargetFilter['variants'];
  // début du nom de la carte
  names?: string[];
};

/** Durée d'un effet qui dure (étape 2). */
export type ScriptDuration =
  // jusqu'à la fin de ce tour
  | 'thisTurn'
  // jusqu'à la fin du prochain tour de l'adversaire (par défaut)
  | 'opponentNextTurn'
  // seulement pendant votre prochain tour
  | 'ownNextTurn'
  // seulement pendant le tour suivant (celui qui vient juste après)
  | 'nextTurn'
  // tant que le Pokémon reste en jeu
  | 'whileInPlay';

/** Immunités possibles. */
export type ScriptImmunity = 'damage' | 'effects' | 'conditions' | SpecialCondition;

/** Ce qu'on peut empêcher. */
export type ScriptPrevent =
  | 'attack'
  | 'retreat'
  | 'talent'
  | 'heal'
  | 'energy'
  | 'items'
  | 'supporters'
  // seulement les cartes Outil (les autres Objets restent permis)
  | 'tools';

/** Effet qui dure, posé sur un Pokémon (ou un joueur). */
export type ScriptModifier = {
  kind:
    | 'retreatCost'
    | 'maxHp'
    | 'resistance'
    | 'boost'
    | 'immunity'
    | 'prevent'
    | 'whenDamaged'
    | 'poisonDamage'
    | 'burnDamage'
    | 'retreatDespiteConditions'
    | 'whenPlayed';
  amount?: number;
  against?: ScriptImmunity[];
  prevent?: ScriptPrevent[];
  from?: ScriptTargetFilter;
  attackName?: string;
  vs?: ScriptTargetFilter;
  script?: ScriptBlock[];
  sourceName: string;
  sourcePlayer: Player;
  // nombre de fins de tour avant que l'effet commence (0 = actif)
  startsIn: number;
  // nombre de fins de tour avant que l'effet disparaisse (null = tant qu'il est en jeu)
  endsIn: number | null;
};

/** Qui reçoit l'effet. */
export type ScriptTarget = {
  // camp : 'own' (le sien), 'opponent' (l'adversaire), 'both' (les deux)
  // Par défaut : 'own' pour heal / attachEnergy / removeConditions, sinon 'opponent'.
  side?: 'own' | 'opponent' | 'both';
  // 'self'   : le Pokémon qui attaque / qui a le talent
  // 'active' : le Pokémon actif (avec une attaque ou un talent : celui de la colonne)
  // 'chosen' : le joueur clique sur `count` Pokémon (1 par défaut)
  // 'all'    : tous les Pokémon du camp qui respectent `filter`
  // 'player' : le joueur lui-même (dégâts, Poison / Brûlure, prevent items / supporters)
  // 'attacker': le Pokémon qui vient d'attaquer (seulement dans un script whenDamaged)
  // Par défaut : 'chosen'.
  // 'previous' : la (les) même(s) cible(s) que le bloc d'avant (sans redemander)
  who?: 'self' | 'active' | 'chosen' | 'all' | 'player' | 'attacker' | 'previous';
  // pour 'chosen' : nombre de Pokémon à choisir (différents)
  count?: number;
  // contraintes (mêmes réglages que les cartes Dresseur, plus quelques-uns)
  filter?: ScriptTargetFilter;
  // switch, dans `to` : true = peut aussi aller sur une case VIDE
  // (par défaut, un switch échange seulement avec un autre Pokémon de son camp)
  emptyCells?: boolean;
  // qui fait le choix : 'self' (le joueur de la carte, par défaut) ou 'opponent' (l'adversaire)
  chooser?: 'self' | 'opponent';
  // who: 'chosen' avec damage / counters / condition : le joueur adverse peut aussi être choisi
  // (par défaut ; false = seulement des Pokémon)
  includePlayer?: boolean;
  // switch, dans `to` : true = n'importe quelle case de son camp
  // (par défaut, l'échange se fait sur la même ligne, d'une colonne à l'autre, comme Guzma)
  anyRow?: boolean;
};

export type ScriptTargetFilter = TrainerTargetFilter & {
  // seulement les Pokémon blessés
  damaged?: boolean;
  // jamais le Pokémon qui attaque / qui a le talent
  excludeSelf?: boolean;
};

/** Un bloc du script. */
export type ScriptBlock = {
  action: ScriptAction;
  amount?: number;
  energyType?: EnergyType;
  conditions?: SpecialCondition[];
  target?: ScriptTarget;
  // Lancer de pièces avant le bloc (avec le compteur du Pokémon, ou de la carte Dresseur) :
  // need 'face' (au moins une FACE, par défaut), 'allFace' (que des FACE),
  // 'perFace' (amount × nombre de FACE), et pareil côté PILE :
  // 'tails' (au moins une PILE), 'allTails' (que des PILE), 'perTails' (amount × nombre de PILE).
  // useLastFlip: true = ne relance pas, reprend le dernier lancer de ce script (pour faire « sinon »).
  coin?: {
    count?: number;
    need?: 'face' | 'allFace' | 'perFace' | 'tails' | 'allTails' | 'perTails';
    useLastFlip?: boolean;
  };
  // Condition « si … » : le bloc ne s'applique que si le compte est entre `min` et `max`.
  // Une liste = toutes les conditions doivent être vraies.
  if?: ScriptCondition | ScriptCondition[];
  // Panneau OUI / NON avant le bloc (true, ou le texte de la question).
  optional?: boolean | string;

  // ----- ÉTAPE 2 -----
  // Durée des effets qui durent (par défaut 'opponentNextTurn', 'thisTurn' pour boost).
  duration?: ScriptDuration;
  // immunity : contre quoi
  against?: ScriptImmunity[];
  // prevent : ce qui est interdit
  prevent?: ScriptPrevent[];
  // resistance / immunity / whenDamaged : seulement contre ces attaquants
  from?: ScriptTargetFilter;
  // boost : seulement cette attaque
  attackName?: string;
  // boost : seulement contre ces Pokémon (ex : { variants: ['gx', 'ex'] })
  vs?: ScriptTargetFilter;
  // whenDamaged : le script à lancer
  script?: ScriptBlock[];

  // ----- ÉTAPE 3 -----
  // switch / moveEnergy / moveDamage : la destination
  to?: ScriptTarget;
  // summon : nom du Pokémon qui apparaît
  pokemonName?: string;
  // summon : OU un Pokémon au choix parmi ceux qui respectent ces contraintes
  pokemon?: ScriptPokemonFilter;
  // summon : ce qu'on invoque : 'pokemon' (par défaut, sur le plateau), ou une carte Dresseur
  // 'supporter' / 'objet' / 'outil' (dans la MAIN). Choisie à la préparation, comme les Pokémon.
  // `cards` ajoute des contraintes (ex : { names: ['Potion'] }), `target.count` = combien.
  kind?: 'pokemon' | 'supporter' | 'objet' | 'outil';
  // summon : Invocation (par défaut) ou Pokémon normal
  invocation?: boolean;
  // attachEnergy : prendre les Énergies dans la pile de défausse du joueur
  fromDiscard?: boolean;
  // plusieurs types d'Énergie possibles (« Psy ou Métal ») : à la place de `energyType`
  // (attachEnergy, discardEnergy, moveEnergy)
  energyTypes?: EnergyType[];
  // recoverCards : quelles cartes
  cards?: ScriptCardFilter;

  // « pour chaque … » : `amount` est multiplié par ce nombre
  per?: ScriptCount;
  // prevent avec 'attack' : on choisit UNE attaque du Pokémon ciblé
  chooseAttack?: boolean;
  // condition 'poison' : nombre de marqueurs posés à chaque fin de tour (au lieu de 1)
  poisonCounters?: number;
};

/** Script en cours (état de la partie). */
/** Un Pokémon mis K.O. (journal pour count: 'knockedOut'). */
export type KnockoutRecord = {
  turnId: number;
  // joueur à qui appartenait le Pokémon
  owner: Player;
  // le Pokémon tel qu'il était juste avant le K.O. (pour les contraintes `filter`)
  pokemon: PokemonInPlay;
};

export type PendingScript = {
  player: Player;
  sourceName: string;
  // case du Pokémon source (attaque, talent), null pour une carte Dresseur
  sourceCell: string | null;
  trainerCard: TrainerCard | null;
  blocks: ScriptBlock[];
  index: number;
  // run : à traiter ; optional : attend OUI / NON ; coin : attend la pièce ; target : attend un clic
  // 'destination' : choix de la case d'arrivée ; 'card' : choix d'une carte de la défausse
  // 'attack' : choix d'une attaque du Pokémon ciblé (blockAttack)
  stage: 'run' | 'optional' | 'coin' | 'target' | 'destination' | 'card' | 'attack';
  optionalAnswer?: boolean;
  coinKey?: string;
  coinResult?: CoinSide[] | null;
  // dernier lancer de pièces du script (coin.useLastFlip)
  lastCoinResult?: CoinSide[] | null;
  chosenCells?: string[];
  turnId: number;
  // whenDamaged : case du Pokémon qui a attaqué
  attackerCell?: string | null;
  // étape 3 : destination choisie (switch, moveEnergy, moveDamage)
  toCell?: string | null;
  // étape 3 : cartes déjà reprises de la défausse (recoverCards)
  pickedCards?: number;
  // blockAttack : attaque choisie
  chosenAttack?: string | null;
  // cibles du dernier bloc appliqué (who: 'previous')
  lastTargets?: string[];
  // joueur qui fait le choix en cours (chooser: 'opponent'), sinon `player`
  chooser?: Player | null;
  // endTurn : le tour se termine à la fin du script
  endTurnAfter?: boolean;
  // script suivant à lancer après celui-ci (déclencheurs en file d'attente)
  then?: PendingScript | null;
};
