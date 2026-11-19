import type { TrainerCard, TrainerTargetFilter } from './cards';
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
  // place `amount` dégâts (marqueurs : ni faiblesse ni résistance), peut mettre K.O.
  | 'damage'
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
  | 'attackDamage';

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
    | 'tools';
  // 'own' (par défaut), 'opponent' ou 'both'
  side?: 'own' | 'opponent' | 'both';
  // 'all' (par défaut), 'self' (ce Pokémon) ou 'active' (l'actif de la colonne)
  who?: 'self' | 'active' | 'all';
  filter?: ScriptTargetFilter;
  cards?: ScriptCardFilter;
  energyType?: EnergyType;
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
  | 'supporters';

/** Effet qui dure, posé sur un Pokémon (ou un joueur). */
export type ScriptModifier = {
  kind: 'retreatCost' | 'maxHp' | 'resistance' | 'boost' | 'immunity' | 'prevent' | 'whenDamaged';
  amount?: number;
  against?: ScriptImmunity[];
  prevent?: ScriptPrevent[];
  from?: ScriptTargetFilter;
  attackName?: string;
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
  who?: 'self' | 'active' | 'chosen' | 'all' | 'player' | 'attacker';
  // pour 'chosen' : nombre de Pokémon à choisir (différents)
  count?: number;
  // contraintes (mêmes réglages que les cartes Dresseur, plus quelques-uns)
  filter?: ScriptTargetFilter;
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
  // 'perFace' (amount × nombre de FACE).
  coin?: { count?: number; need?: 'face' | 'allFace' | 'perFace' };
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
  // whenDamaged : le script à lancer
  script?: ScriptBlock[];

  // ----- ÉTAPE 3 -----
  // switch / moveEnergy / moveDamage : la destination
  to?: ScriptTarget;
  // summon : nom du Pokémon qui apparaît
  pokemonName?: string;
  // summon : OU un Pokémon au choix parmi ceux qui respectent ces contraintes
  pokemon?: ScriptPokemonFilter;
  // summon : Invocation (par défaut) ou Pokémon normal
  invocation?: boolean;
  // attachEnergy : prendre les Énergies dans la pile de défausse du joueur
  fromDiscard?: boolean;
  // recoverCards : quelles cartes
  cards?: ScriptCardFilter;

  // « pour chaque … » : `amount` est multiplié par ce nombre
  per?: ScriptCount;
  // prevent avec 'attack' : on choisit UNE attaque du Pokémon ciblé
  chooseAttack?: boolean;
};

/** Script en cours (état de la partie). */
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
  // script suivant à lancer après celui-ci (déclencheurs en file d'attente)
  then?: PendingScript | null;
};
