import type { Attack, ScriptBlock } from '@/features/game/types';
import { computeScriptCount, isScriptConditionMet, type ScriptCountContext } from './script-modifiers';

// =====================================================================
// CODE DES CARTES — dégâts d'attaque en plus (`attackDamage`)
// (le comptage `per` / `if` est dans script-modifiers.ts)
// =====================================================================

/** Valeur d'un bloc : `amount`, multiplié par `per` s'il y en a un. */
export function getScriptBlockAmount(block: ScriptBlock, context: ScriptCountContext): number {
  const amount = block.amount ?? 0;
  return block.per ? amount * computeScriptCount(block.per, context) : amount;
}

/** Dégâts en plus de l'attaque (blocs `attackDamage` de son script). */
export function getScriptAttackDamageBonus(attack: Attack, context: ScriptCountContext): number {
  return (attack.script ?? [])
    .filter((block) => block.action === 'attackDamage' && isScriptConditionMet(block.if, context))
    .reduce((total, block) => total + getScriptBlockAmount(block, context), 0);
}

/**
 * Bloc d'attaque vérifié AVANT la frappe ('attackFails', 'attackIgnoresReductions') :
 * vrai si au moins un de ces blocs a sa condition `if` remplie (ou n'en a pas).
 */
export function hasScriptAttackFlag(
  attack: Attack,
  action: 'attackFails' | 'attackIgnoresReductions',
  context: ScriptCountContext
): boolean {
  return (attack.script ?? []).some(
    (block) => block.action === action && isScriptConditionMet(block.if, context)
  );
}
