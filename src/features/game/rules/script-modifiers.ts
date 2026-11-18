import type {
  BoardState,
  Player,
  PlayerStatusState,
  PokemonInPlay,
  ScriptBlock,
  ScriptDuration,
  ScriptImmunity,
  ScriptModifier,
  ScriptPrevent,
  ScriptTargetFilter,
  SpecialCondition,
} from '@/features/game/types';
import { isTalentNegatedAt } from './talent-negation';

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
  cell?: string | null
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

  if (filter.position && board) {
    const where = cell ?? findCell(board, pokemon);
    if (where) {
      const isActive = isFrontPokemonCell(board, where);
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
  }
}

// ---------------------------------------------------------------
// LECTURE (utilisées par les règles du jeu)
// ---------------------------------------------------------------

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
        (!modifier.attackName || normalize(modifier.attackName) === normalize(attackName))
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
    if (!holder || !isPassiveScriptActive(board, cell, holder)) return false;

    return (holder.card.talent?.script ?? []).some((block) => {
      if (block.action !== 'prevent' || block.target?.who !== 'player') return false;
      if (!(block.prevent ?? []).includes(what)) return false;
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

/** Effets que chaque Pokémon reçoit des talents passifs en jeu. */
export function computeAuraModifiers(board: BoardState): Record<string, ScriptModifier[]> {
  const result: Record<string, ScriptModifier[]> = {};

  for (const [holderCell, holder] of Object.entries(board)) {
    if (!holder || !isPassiveScriptActive(board, holderCell, holder)) continue;

    for (const block of holder.card.talent?.script ?? []) {
      if (!isModifierAction(block.action)) continue;

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
        if (!matchesPokemonFilter(pokemon, filter, board, cell)) continue;

        const modifier = createScriptModifier(block, holder.card.talent?.name ?? holder.card.name, holder.owner, null);
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
