import type {
  BoardState,
  EnergyType,
  GameCard,
  KnockoutRecord,
  Player,
  PlayerStatusState,
  PokemonInPlay,
  ScriptBlock,
  ScriptCondition,
  ScriptCount,
  ScriptDuration,
  ScriptImmunity,
  ScriptModifier,
  ScriptPrevent,
  ScriptTargetFilter,
  SpecialCondition,
} from '@/features/game/types';
import { isTalentNegatedAt } from './talent-negation';
import { matchesCardFilter } from './script-cards';

// =====================================================================
// CODE DES CARTES — ÉTAPE 2 : effets qui DURENT
// (coût de retraite, PV max, résistance, boost, immunités, interdictions,
//  déclencheur « si ce Pokémon subit des dégâts »)
//
// - `scriptModifiers` : posés par une attaque, un talent à activer ou un Dresseur,
//   avec une durée (comptée en fins de tour) ;
// - `auraModifiers`   : ceux des talents passifs en jeu, recalculés tout seuls.
// =====================================================================

/** Actions du script qui posent un effet qui dure. */
export const MODIFIER_ACTIONS = [
  'retreatCost',
  'maxHp',
  'resistance',
  'boost',
  'immunity',
  'prevent',
  'whenDamaged',
  'poisonDamage',
  'burnDamage',
  'retreatDespiteConditions',
  'whenPlayed',
] as const;

export function isModifierAction(action: ScriptBlock['action']): action is ScriptModifier['kind'] {
  return (MODIFIER_ACTIONS as readonly string[]).includes(action);
}

/** Camp par défaut d'une action (quand `target.side` est absent). */
export function getDefaultScriptSide(block: ScriptBlock): 'own' | 'opponent' {
  switch (block.action) {
    case 'heal':
    case 'attachEnergy':
    case 'removeConditions':
    case 'maxHp':
    case 'resistance':
    case 'boost':
    case 'immunity':
    case 'whenDamaged':
    case 'whenPlayed':
    case 'retreatDespiteConditions':
    case 'swapDamage':
    case 'switch':
    case 'moveEnergy':
    case 'moveDamage':
    case 'summon':
    case 'returnToHand':
    case 'returnTool':
    case 'recoverCards':
      return 'own';
    case 'retreatCost':
      // baisser son coût de retraite = ses Pokémon ; l'augmenter = ceux de l'adversaire
      return (block.amount ?? 0) < 0 ? 'own' : 'opponent';
    default:
      return 'opponent';
  }
}

// ---------------------------------------------------------------
// OUTILS
// ---------------------------------------------------------------

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Case du Pokémon de devant de cette colonne, pour ce joueur (ou null). */
function frontCellInColumn(board: BoardState, column: string, owner: Player): string | null {
  const rows = owner === 1 ? ['B', 'A'] : ['C', 'D'];
  return rows.map((row) => `${row}${column}`).find((cell) => board[cell]) ?? null;
}

/** Le Pokémon en `cell` est-il l'actif de sa colonne (personne devant lui) ? */
export function isFrontPokemonCell(board: BoardState, cell: string): boolean {
  const pokemon = board[cell];
  if (!pokemon) return false;

  const rows = pokemon.owner === 1 ? ['B', 'A'] : ['C', 'D'];
  const column = cell.slice(1);
  const front = rows.map((row) => `${row}${column}`).find((other) => board[other]);
  return front === cell;
}

function findCell(board: BoardState, pokemon: PokemonInPlay): string | null {
  const entry = Object.entries(board).find(([, other]) => other === pokemon);
  if (entry) return entry[0];
  const same = Object.entries(board).find(
    ([, other]) => other !== null && other.card === pokemon.card && other.owner === pokemon.owner
  );
  return same ? same[0] : null;
}

/** Effets actifs d'un Pokémon (ceux qui ont commencé + ceux des talents passifs). */
export function getActiveModifiers(pokemon: PokemonInPlay | null | undefined): ScriptModifier[] {
  if (!pokemon) return [];
  return [
    ...(pokemon.scriptModifiers ?? []).filter((modifier) => modifier.startsIn <= 0),
    ...(pokemon.auraModifiers ?? []),
  ];
}

/** Bonus de PV max dû au code des cartes. */
export function getScriptMaxHpBonus(pokemon: PokemonInPlay): number {
  return getActiveModifiers(pokemon)
    .filter((modifier) => modifier.kind === 'maxHp')
    .reduce((total, modifier) => total + (modifier.amount ?? 0), 0);
}

function getMaxHpForFilter(pokemon: PokemonInPlay): number {
  return (
    pokemon.card.maxHp +
    (pokemon.attachedTool?.effect === 'toolHp40' ? 40 : 0) +
    getScriptMaxHpBonus(pokemon)
  );
}

/**
 * Le Pokémon respecte-t-il les contraintes ?
 * (`board` et `cell` servent pour `position` ; sans eux, `position` est ignorée)
 */
export function matchesPokemonFilter(
  pokemon: PokemonInPlay,
  filter: ScriptTargetFilter | undefined,
  board?: BoardState | null,
  cell?: string | null,
  // Pokémon qui attaque / qui a le talent : sert à `position` (voir plus bas)
  sourceCell?: string | null
): boolean {
  if (!filter) return true;

  if (filter.pokemonTypes?.length && !filter.pokemonTypes.includes(pokemon.card.type)) return false;
  if (
    filter.pokemonNames?.length &&
    !filter.pokemonNames.some((name) => normalize(pokemon.card.name).startsWith(normalize(name)))
  ) {
    return false;
  }
  if (filter.stages?.length && !filter.stages.includes(pokemon.card.stage)) return false;
  if (filter.variants?.length && !filter.variants.includes(pokemon.card.variant)) return false;
  if (filter.hasEnergyType && !pokemon.energies.includes(filter.hasEnergyType)) return false;
  if (filter.hasEnergy && pokemon.energies.length === 0) return false;
  if (filter.damaged && pokemon.currentHp >= getMaxHpForFilter(pokemon)) return false;

  // Talent, Outil, Invocation, PV, nombre d'Énergies
  if (filter.hasTalent !== undefined && !!pokemon.card.talent !== filter.hasTalent) return false;
  if (filter.hasTool !== undefined && !!pokemon.attachedTool !== filter.hasTool) return false;
  if (filter.isInvocation !== undefined && !!pokemon.isInvocation !== filter.isInvocation) return false;
  if (filter.hpAtMost !== undefined && pokemon.currentHp > filter.hpAtMost) return false;
  if (filter.hpAtLeast !== undefined && pokemon.currentHp < filter.hpAtLeast) return false;
  if (filter.maxHpAtMost !== undefined && getMaxHpForFilter(pokemon) > filter.maxHpAtMost) return false;
  if (filter.maxHpAtLeast !== undefined && getMaxHpForFilter(pokemon) < filter.maxHpAtLeast) return false;
  if (filter.energiesAtLeast !== undefined && pokemon.energies.length < filter.energiesAtLeast) return false;
  if (filter.energiesAtMost !== undefined && pokemon.energies.length > filter.energiesAtMost) return false;
  if (
    filter.hasAnyEnergyType?.length &&
    !filter.hasAnyEnergyType.some((type) => pokemon.energies.includes(type))
  ) {
    return false;
  }

  // États spéciaux
  const hasState: Record<SpecialCondition, boolean> = {
    poison: pokemon.poisoned === true,
    burn: pokemon.burned === true,
    paralyze: pokemon.paralyzed === true,
    confuse: pokemon.confused === true,
    sleep: pokemon.asleep === true,
  };
  if (filter.conditions?.length && !filter.conditions.some((condition) => hasState[condition])) return false;
  if (filter.hasCondition !== undefined) {
    const any = Object.values(hasState).some(Boolean);
    if (any !== filter.hasCondition) return false;
  }

  if (filter.position && board) {
    const where = cell ?? findCell(board, pokemon);
    if (where) {
      // Avec un Pokémon source (attaque, talent) :
      // - vos Pokémon : l'actif = celui qui attaque / a le talent, le banc = tous les autres ;
      // - ceux de l'adversaire : l'actif = celui juste devant le Pokémon source, le banc = tous les autres.
      // Sans source (Dresseur) : l'actif = le Pokémon de devant de sa colonne.
      const source = sourceCell ? board[sourceCell] : null;
      const isActive =
        sourceCell && source
          ? pokemon.owner === source.owner
            ? // le Pokémon source lui-même n'est l'actif que s'il est devant dans sa colonne
              where === sourceCell && isFrontPokemonCell(board, where)
            : where === frontCellInColumn(board, sourceCell.slice(1), pokemon.owner)
          : isFrontPokemonCell(board, where);
      if (filter.position === 'active' && !isActive) return false;
      if (filter.position === 'bench' && isActive) return false;
    }
  }

  return true;
}

/** L'attaquant est-il concerné par `from` (et bien un Pokémon ADVERSE) ? */
function attackerMatches(
  modifier: ScriptModifier,
  target: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined,
  board?: BoardState | null
): boolean {
  if (!attacker || attacker.owner === target.owner) return false;
  return matchesPokemonFilter(attacker, modifier.from, board);
}

// ---------------------------------------------------------------
// CRÉATION
// ---------------------------------------------------------------

/** Fins de tour avant le début et avant la fin, selon la durée. */
export function getDurationCounters(
  duration: ScriptDuration,
  creator: Player,
  currentPlayer: Player
): { startsIn: number; endsIn: number | null } {
  const ownTurnNow = creator === currentPlayer;

  switch (duration) {
    case 'thisTurn':
      return { startsIn: 0, endsIn: 1 };
    case 'nextTurn':
      return { startsIn: 1, endsIn: 2 };
    case 'ownNextTurn':
      return ownTurnNow ? { startsIn: 2, endsIn: 3 } : { startsIn: 1, endsIn: 2 };
    case 'whileInPlay':
      return { startsIn: 0, endsIn: null };
    case 'opponentNextTurn':
    default:
      return ownTurnNow ? { startsIn: 0, endsIn: 2 } : { startsIn: 0, endsIn: 3 };
  }
}

export function createScriptModifier(
  block: ScriptBlock,
  sourceName: string,
  creator: Player,
  currentPlayer: Player | null
): ScriptModifier | null {
  if (!isModifierAction(block.action)) return null;

  const duration = block.duration ?? (block.action === 'boost' ? 'thisTurn' : 'opponentNextTurn');
  const counters =
    currentPlayer === null
      ? { startsIn: 0, endsIn: null }
      : getDurationCounters(duration, creator, currentPlayer);

  return {
    kind: block.action,
    amount: block.amount,
    against: block.against,
    prevent: block.prevent,
    from: block.from,
    attackName: block.attackName,
    vs: block.vs,
    script: block.script,
    sourceName,
    sourcePlayer: creator,
    ...counters,
  };
}

/** Texte court pour le message de la partie. */
export function describeModifier(modifier: ScriptModifier): string {
  const amount = modifier.amount ?? 0;
  const signed = amount > 0 ? `+${amount}` : `${amount}`;

  switch (modifier.kind) {
    case 'retreatCost':
      return `coût de retraite ${signed}`;
    case 'maxHp':
      return `PV max ${signed}`;
    case 'resistance':
      return amount >= 0 ? `subit ${amount} dégâts de moins` : `subit ${-amount} dégâts de plus`;
    case 'boost':
      return amount >= 0 ? `ses attaques font +${amount}` : `ses attaques font ${amount}`;
    case 'immunity':
      return `immunisé (${(modifier.against ?? ['damage']).join(', ')})`;
    case 'prevent':
      return modifier.attackName
        ? `ne peut pas utiliser ${modifier.attackName}`
        : `ne peut plus : ${(modifier.prevent ?? []).join(', ')}`;
    case 'whenDamaged':
      return 'riposte si blessé';
    case 'poisonDamage':
      return `le Poison lui inflige ${amount} dégâts de plus`;
    case 'burnDamage':
      return `la Brûlure lui inflige ${amount} dégâts de plus`;
    case 'retreatDespiteConditions':
      return 'peut battre en retraite même Endormi ou Paralysé';
    case 'whenPlayed':
      return 'effet quand il est joué';
  }
}

// ---------------------------------------------------------------
// LECTURE (utilisées par les règles du jeu)
// ---------------------------------------------------------------

/** Somme des `amount` des effets `kind` actifs sur ce Pokémon. */
export function getScriptModifierTotal(
  pokemon: PokemonInPlay | null | undefined,
  kind: ScriptModifier['kind']
): number {
  return getActiveModifiers(pokemon)
    .filter((modifier) => modifier.kind === kind)
    .reduce((total, modifier) => total + (modifier.amount ?? 0), 0);
}

/** Ce Pokémon a-t-il au moins un effet `kind` actif ? */
export function hasScriptModifier(pokemon: PokemonInPlay | null | undefined, kind: ScriptModifier['kind']): boolean {
  return getActiveModifiers(pokemon).some((modifier) => modifier.kind === kind);
}

/** Joueur qui fait le choix en cours d'un script (chooser: 'opponent'), sinon celui de la carte. */
export function getScriptActor(script: { player: Player; chooser?: Player | null }): Player {
  return script.chooser ?? script.player;
}

export function getScriptRetreatCostDelta(pokemon: PokemonInPlay): number {
  return getActiveModifiers(pokemon)
    .filter((modifier) => modifier.kind === 'retreatCost')
    .reduce((total, modifier) => total + (modifier.amount ?? 0), 0);
}

/** Dégâts en moins (négatif : en plus) sur les attaques de `attacker`. */
export function getScriptResistance(
  target: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined,
  board?: BoardState | null
): number {
  return getActiveModifiers(target)
    .filter(
      (modifier) =>
        modifier.kind === 'resistance' && attackerMatches(modifier, target, attacker, board)
    )
    .reduce((total, modifier) => total + (modifier.amount ?? 0), 0);
}

/** Dégâts en plus (négatif : en moins) des attaques de ce Pokémon. */
export function getScriptBoost(pokemon: PokemonInPlay, attackName: string): number {
  return getActiveModifiers(pokemon)
    .filter(
      (modifier) =>
        modifier.kind === 'boost' &&
        // les boosts « seulement contre … » (vs) dépendent de la cible : voir getScriptBoostVs
        !modifier.vs &&
        (!modifier.attackName || normalize(modifier.attackName) === normalize(attackName))
    )
    .reduce((total, modifier) => total + (modifier.amount ?? 0), 0);
}

/** Boosts « seulement contre … » (`vs`) de l'attaquant qui s'appliquent à cette cible. */
export function getScriptBoostVs(
  attacker: PokemonInPlay | null | undefined,
  target: PokemonInPlay | null | undefined,
  attackName: string,
  board?: BoardState | null
): number {
  if (!attacker || !target || attacker.owner === target.owner) return 0;
  return getActiveModifiers(attacker)
    .filter(
      (modifier) =>
        modifier.kind === 'boost' &&
        !!modifier.vs &&
        (!modifier.attackName || normalize(modifier.attackName) === normalize(attackName)) &&
        matchesPokemonFilter(target, modifier.vs, board)
    )
    .reduce((total, modifier) => total + (modifier.amount ?? 0), 0);
}

/**
 * Immunité du Pokémon contre `kind` :
 * - 'damage' / 'effects' : contre les attaques de `attacker` (Pokémon adverse) ;
 * - un état spécial : contre les états venant de l'adversaire.
 */
export function hasScriptImmunity(
  target: PokemonInPlay,
  kind: 'damage' | 'effects' | SpecialCondition,
  attacker: PokemonInPlay | null | undefined,
  board?: BoardState | null
): boolean {
  return getActiveModifiers(target).some((modifier) => {
    if (modifier.kind !== 'immunity') return false;

    const against: ScriptImmunity[] = modifier.against ?? ['damage'];
    const covered =
      kind === 'damage' || kind === 'effects'
        ? against.includes(kind)
        : against.includes(kind) || against.includes('conditions');
    if (!covered) return false;

    // Sans attaquant connu (Dresseur, talent…) : seulement si aucun `from`.
    if (!attacker) return !modifier.from;
    return attackerMatches(modifier, target, attacker, board);
  });
}

/** Retire les états spéciaux contre lesquels le Pokémon est immunisé. */
export function filterImmuneConditions(
  target: PokemonInPlay,
  conditions: SpecialCondition[],
  sourcePlayer: Player
): SpecialCondition[] {
  if (sourcePlayer === target.owner) return conditions;
  return conditions.filter((condition) => !hasScriptImmunity(target, condition, null));
}

/**
 * Après une attaque : annule les états spéciaux NOUVEAUX
 * contre lesquels le Pokémon est immunisé.
 */
export function revertImmuneConditions(
  before: PokemonInPlay,
  after: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined,
  board?: BoardState | null
): PokemonInPlay {
  const immune = (condition: SpecialCondition) => hasScriptImmunity(before, condition, attacker, board);
  let result = after;

  if (!before.poisoned && after.poisoned && immune('poison')) {
    result = { ...result, poisoned: false, poisonSourcePlayer: before.poisonSourcePlayer };
  }
  if (!before.burned && after.burned && immune('burn')) {
    result = {
      ...result,
      burned: false,
      burnSourcePlayer: before.burnSourcePlayer,
      burnTriggersRemaining: before.burnTriggersRemaining,
    };
  }
  if (!before.paralyzed && after.paralyzed && immune('paralyze')) {
    result = { ...result, paralyzed: false, paralysisTurnsRemaining: before.paralysisTurnsRemaining };
  }
  if (!before.confused && after.confused && immune('confuse')) {
    result = { ...result, confused: false, confusionTurnsRemaining: before.confusionTurnsRemaining };
  }
  if (!before.asleep && after.asleep && immune('sleep')) {
    result = {
      ...result,
      asleep: false,
      sleepSourcePlayer: before.sleepSourcePlayer,
      sleepEndPlayer: before.sleepEndPlayer,
    };
  }

  return result;
}

/** Ce Pokémon a-t-il l'interdiction `what` ? */
export function isScriptPrevented(
  pokemon: PokemonInPlay | null | undefined,
  what: ScriptPrevent
): boolean {
  return getActiveModifiers(pokemon).some(
    (modifier) =>
      modifier.kind === 'prevent' &&
      (modifier.prevent ?? []).includes(what) &&
      // une interdiction sur UNE attaque précise ne bloque pas les autres
      !(what === 'attack' && modifier.attackName)
  );
}

/** Ce Pokémon a-t-il l'interdiction d'utiliser l'attaque `attackName` ? */
export function isScriptAttackPrevented(
  pokemon: PokemonInPlay | null | undefined,
  attackName: string
): boolean {
  return getActiveModifiers(pokemon).some(
    (modifier) =>
      modifier.kind === 'prevent' &&
      (modifier.prevent ?? []).includes('attack') &&
      (!modifier.attackName || normalize(modifier.attackName) === normalize(attackName))
  );
}

/** Contexte de comptage sans main ni défausse (talents passifs). */
function boardOnlyContext(board: BoardState, player: Player, sourceCell: string): ScriptCountContext {
  return {
    board,
    player,
    sourceCell,
    player1Discard: [],
    player2Discard: [],
    player1Hand: [],
    player2Hand: [],
  };
}

/** Le joueur a-t-il l'interdiction `what` (Objets, Supporters) ? */
export function isPlayerScriptPrevented(
  status: PlayerStatusState,
  board: BoardState | null | undefined,
  player: Player,
  what: ScriptPrevent
): boolean {
  const timed = (status.scriptModifiers ?? []).some(
    (modifier) =>
      modifier.startsIn <= 0 && modifier.kind === 'prevent' && (modifier.prevent ?? []).includes(what)
  );
  if (timed || !board) return timed;

  // Talents passifs : « votre adversaire ne peut pas jouer de carte Objet ».
  return Object.entries(board).some(([cell, holder]) => {
    if (!holder) return false;

    return getContinuousScripts(board, cell, holder).blocks.some((block) => {
      if (block.action !== 'prevent' || block.target?.who !== 'player') return false;
      if (!(block.prevent ?? []).includes(what)) return false;
      if (block.if && !isScriptConditionMet(block.if, boardOnlyContext(board, holder.owner, cell))) return false;
      return sidePlayersFor(block, holder.owner).includes(player);
    });
  });
}

// ---------------------------------------------------------------
// FIN DE TOUR
// ---------------------------------------------------------------

/** Avance les compteurs d'une liste (une fin de tour). */
export function advanceModifierList(list: ScriptModifier[] | undefined): ScriptModifier[] | undefined {
  if (!list || list.length === 0) return list;

  return list
    .map((modifier) => ({
      ...modifier,
      startsIn: Math.max(0, modifier.startsIn - 1),
      endsIn: modifier.endsIn === null ? null : modifier.endsIn - 1,
    }))
    .filter((modifier) => modifier.endsIn === null || modifier.endsIn > 0);
}

/** Fin de tour d'un Pokémon : compteurs + PV si un bonus de PV commence ou finit. */
export function advancePokemonModifiers(pokemon: PokemonInPlay): PokemonInPlay {
  if (!pokemon.scriptModifiers || pokemon.scriptModifiers.length === 0) return pokemon;

  const before = getScriptMaxHpBonus(pokemon);
  const updated: PokemonInPlay = {
    ...pokemon,
    scriptModifiers: advanceModifierList(pokemon.scriptModifiers),
  };
  const delta = getScriptMaxHpBonus(updated) - before;

  return delta === 0 ? updated : { ...updated, currentHp: updated.currentHp + delta };
}

// ---------------------------------------------------------------
// TALENTS PASSIFS (« auras »)
// ---------------------------------------------------------------

function sidePlayersFor(block: ScriptBlock, owner: Player): Player[] {
  const opponent: Player = owner === 1 ? 2 : 1;
  const side = block.target?.side ?? getDefaultScriptSide(block);
  return side === 'own' ? [owner] : side === 'opponent' ? [opponent] : [owner, opponent];
}

/** Le talent passif « script » de ce Pokémon fonctionne-t-il ? */
function isPassiveScriptActive(board: BoardState, cell: string, holder: PokemonInPlay): boolean {
  const talent = holder.card.talent;
  if (!talent || talent.type !== 'passive' || talent.effect !== 'script') return false;
  if (isTalentNegatedAt(board, cell, holder.owner, holder.card)) return false;

  // Seuls les effets à durée peuvent bloquer un talent passif (pas d'aura contre aura).
  return !(holder.scriptModifiers ?? []).some(
    (modifier) =>
      modifier.startsIn <= 0 && modifier.kind === 'prevent' && (modifier.prevent ?? []).includes('talent')
  );
}

/**
 * Blocs qui agissent en continu pour ce Pokémon :
 * son talent passif « script » (s'il marche) + le script de son Outil.
 */
function getContinuousScripts(
  board: BoardState,
  cell: string,
  holder: PokemonInPlay
): { blocks: ScriptBlock[]; names: string[] } {
  const blocks: ScriptBlock[] = [];
  const names: string[] = [];

  if (isPassiveScriptActive(board, cell, holder)) {
    for (const block of holder.card.talent?.script ?? []) {
      blocks.push(block);
      names.push(holder.card.talent?.name ?? holder.card.name);
    }
  }

  // Outil « script » : ses effets s'appliquent tant qu'il est attaché
  // (who: 'self' = le Pokémon qui porte l'Outil).
  const tool = holder.attachedTool;
  if (tool?.effect === 'script') {
    for (const block of tool.script ?? []) {
      blocks.push(block);
      names.push(tool.name);
    }
  }

  return { blocks, names };
}

/** Effets que chaque Pokémon reçoit des talents passifs et des Outils en jeu. */
export function computeAuraModifiers(board: BoardState): Record<string, ScriptModifier[]> {
  const result: Record<string, ScriptModifier[]> = {};

  for (const [holderCell, holder] of Object.entries(board)) {
    if (!holder) continue;
    const continuous = getContinuousScripts(board, holderCell, holder);

    for (const [blockIndex, block] of continuous.blocks.entries()) {
      if (!isModifierAction(block.action)) continue;
      // « quand il est joué » : déclencheur, pas un effet continu
      if (block.action === 'whenPlayed') continue;
      // « si … » (talent passif : on compte sur le plateau ; main et défausse ne sont pas connues ici)
      if (block.if && !isScriptConditionMet(block.if, boardOnlyContext(board, holder.owner, holderCell))) continue;

      const who = block.target?.who ?? 'all';
      if (who === 'player' || who === 'attacker') continue;

      const players = sidePlayersFor(block, holder.owner);
      const filter = block.target?.filter;
      const column = holderCell.slice(1);

      for (const [cell, pokemon] of Object.entries(board)) {
        if (!pokemon || !players.includes(pokemon.owner)) continue;

        if (who === 'self' && cell !== holderCell) continue;
        if (who === 'active' && (cell.slice(1) !== column || !isFrontPokemonCell(board, cell))) continue;
        if (filter?.excludeSelf && cell === holderCell) continue;
        if (!matchesPokemonFilter(pokemon, filter, board, cell, holderCell)) continue;

        const modifier = createScriptModifier(block, continuous.names[blockIndex], holder.owner, null);
        if (modifier) (result[cell] ??= []).push(modifier);
      }
    }
  }

  return result;
}

function sameModifiers(a: ScriptModifier[] | undefined, b: ScriptModifier[] | undefined): boolean {
  return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
}

/**
 * Met à jour les effets des talents passifs sur le plateau.
 * Renvoie le nouveau plateau, ou null si rien ne change.
 */
export function syncAuraModifiers(board: BoardState): BoardState | null {
  const auras = computeAuraModifiers(board);
  let changed = false;
  const next: BoardState = { ...board };

  for (const [cell, pokemon] of Object.entries(board)) {
    if (!pokemon) continue;
    const wanted = auras[cell];
    if (sameModifiers(pokemon.auraModifiers, wanted)) continue;

    const before = getScriptMaxHpBonus(pokemon);
    const updated: PokemonInPlay = { ...pokemon, auraModifiers: wanted && wanted.length > 0 ? wanted : undefined };
    const delta = getScriptMaxHpBonus(updated) - before;

    // Un talent ne met jamais K.O. en retirant des PV : il reste au moins 10 PV.
    next[cell] = delta === 0 ? updated : { ...updated, currentHp: Math.max(10, updated.currentHp + delta) };
    changed = true;
  }

  return changed ? next : null;
}

/** Le plateau doit-il encore être mis à jour par les talents passifs ? */
export function needsAuraSync(board: BoardState): boolean {
  return syncAuraModifiers(board) !== null;
}

// ---------------------------------------------------------------
// COMPTER (`per`) ET CONDITIONS (`if`)
// ---------------------------------------------------------------

export type ScriptCountContext = {
  board: BoardState;
  // joueur qui joue la carte
  player: Player;
  // case du Pokémon qui attaque / a le talent (null pour un Dresseur)
  sourceCell: string | null;
  player1Discard: GameCard[];
  player2Discard: GameCard[];
  player1Hand: GameCard[];
  player2Hand: GameCard[];
  player1DiscardEnergies?: EnergyType[];
  player2DiscardEnergies?: EnergyType[];
  // count 'knockedOut' : journal des K.O. et tour en cours
  knockouts?: KnockoutRecord[];
  turnId?: number;
};

function sidePlayers(per: ScriptCount, player: Player): Player[] {
  const opponent: Player = player === 1 ? 2 : 1;
  const side = per.side ?? 'own';
  return side === 'own' ? [player] : side === 'opponent' ? [opponent] : [player, opponent];
}

/** Combien de … ? (le nombre par lequel on multiplie `amount`) */
export function computeScriptCount(per: ScriptCount, context: ScriptCountContext): number {
  const players = sidePlayers(per, context.player);

  switch (per.count) {
    case 'discard':
    case 'hand': {
      return players.reduce((total, player) => {
        const cards =
          per.count === 'discard'
            ? player === 1
              ? context.player1Discard
              : context.player2Discard
            : player === 1
              ? context.player1Hand
              : context.player2Hand;
        return total + cards.filter((card) => matchesCardFilter(card, per.cards)).length;
      }, 0);
    }

    case 'damageDealt': {
      const source = context.sourceCell ? context.board[context.sourceCell] : null;
      return source?.lastAttackDamage ?? 0;
    }

    case 'knockedOut': {
      if (context.turnId === undefined) return 0;
      const turn = per.turn ?? 'last';
      const turns =
        turn === 'this' ? [context.turnId] : turn === 'last' ? [context.turnId - 1] : [context.turnId, context.turnId - 1];
      return (context.knockouts ?? []).filter(
        (record) =>
          turns.includes(record.turnId) &&
          players.includes(record.owner) &&
          matchesPokemonFilter(record.pokemon, per.filter)
      ).length;
    }

    case 'discardEnergy': {
      return players.reduce((total, player) => {
        const energies = (player === 1 ? context.player1DiscardEnergies : context.player2DiscardEnergies) ?? [];
        return total + energies.filter((energy) => !per.energyType || energy === per.energyType).length;
      }, 0);
    }

    default: {
      // Pokémon concernés
      const who = per.who ?? 'all';
      const sourceColumn = context.sourceCell ? context.sourceCell.slice(1) : null;

      const cells = Object.keys(context.board).filter((cell) => {
        const pokemon = context.board[cell];
        if (!pokemon || !players.includes(pokemon.owner)) return false;
        if (who === 'self' && cell !== context.sourceCell) return false;
        if (who === 'active') {
          if (!isFrontPokemonCell(context.board, cell)) return false;
          // l'actif de la colonne du Pokémon source (s'il y en a un)
          if (sourceColumn && cell.slice(1) !== sourceColumn) return false;
        }
        return matchesPokemonFilter(pokemon, per.filter, context.board, cell, context.sourceCell);
      });

      return cells.reduce((total, cell) => {
        const pokemon = context.board[cell]!;
        switch (per.count) {
          case 'pokemon':
            return total + 1;
          case 'energy':
            return total + pokemon.energies.filter((energy) => !per.energyType || energy === per.energyType).length;
          case 'damageCounters':
            return total + Math.max(0, Math.floor((getMaxHpForFilter(pokemon) - pokemon.currentHp) / 10));
          case 'tools':
            return total + (pokemon.attachedTool ? 1 : 0);
          case 'retreatCost':
            return total + Math.max(0, pokemon.card.retreatCost + getScriptRetreatCostDelta(pokemon));
          case 'conditions':
            return (
              total +
              [pokemon.poisoned, pokemon.burned, pokemon.paralyzed, pokemon.confused, pokemon.asleep].filter(Boolean)
                .length
            );
          default:
            return total;
        }
      }, 0);
    }
  }
}

/** La condition « si … » est-elle vraie ? (une liste : toutes doivent l'être) */
export function isScriptConditionMet(
  condition: ScriptCondition | ScriptCondition[] | undefined,
  context: ScriptCountContext
): boolean {
  if (!condition) return true;
  const list = Array.isArray(condition) ? condition : [condition];

  return list.every((item) => {
    const count = computeScriptCount(item, context);

    // Comparaison avec un autre compte
    const compares = item.sameAs || item.moreThan || item.lessThan || item.atLeast || item.atMost;
    if (item.sameAs && count !== computeScriptCount(item.sameAs, context)) return false;
    if (item.moreThan && !(count > computeScriptCount(item.moreThan, context))) return false;
    if (item.lessThan && !(count < computeScriptCount(item.lessThan, context))) return false;
    if (item.atLeast && !(count >= computeScriptCount(item.atLeast, context))) return false;
    if (item.atMost && !(count <= computeScriptCount(item.atMost, context))) return false;

    // Sans min / max : « au moins 1 », sauf si on compare déjà avec un autre compte.
    const min = item.min ?? (item.max !== undefined || compares ? 0 : 1);
    if (count < min) return false;
    if (item.max !== undefined && count > item.max) return false;
    return true;
  });
}
