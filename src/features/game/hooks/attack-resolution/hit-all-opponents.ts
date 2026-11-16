import {
  getKnockoutConsequences,
  getRetaliationDamage,
  getAttackerColumnDamageReduction,
  doesTalentBurnAttacker,
  burnAttackingPokemon,
  getTalentDamageReduction,
  isAttackDamagePreventedByEffect,
  getTargetTypeBonusDamage,
} from '@/features/game/rules';
import { doesTemporaryProtectionPreventDamage } from '@/features/game/rules/temporary-attack-protection';
import type { AttackEffect, BoardState, Player, PokemonInPlay } from '@/features/game/types';
import type { AttackResolutionContext } from './attack-resolution-context';

/**
 * Effet 'damageAllOpponentPokemonAndPlayer' :
 * inflige des dégâts à CHAQUE Pokémon de l'adversaire ET au joueur adverse.
 * Les Pokémon de l'attaquant (et l'attaquant lui-même) ne sont pas touchés.
 *
 * Les protections et réductions de l'adversaire s'appliquent, Pokémon par Pokémon :
 * - protection contre les dégâts et effets des attaques ;
 * - protection temporaire contre un stage ou une variante ;
 * - Talents qui empêchent les dégâts (type bloqué, Pokémon-GX/EX) ;
 * - réduction de dégâts jusqu'à la fin du tour adverse ;
 * - Talents de réduction (Azumarill Feu/Eau, « 30 dégâts de moins »).
 */
export function hitAllOpponents(
  context: AttackResolutionContext,
  locals: {
    boardAfterAttack: BoardState;
    amount: number;
    attacker: PokemonInPlay;
    attackName: string;
    selectedPokemonCell: string;
    effects?: AttackEffect[];
  }
): void {
  const {
    doesTalentPreventDamage,
    handleAttackerKO,
    prepareKOEnergyMove,
    setBoard,
    setMessage,
    setPlayer1Damage,
    setPlayer2Damage,
    setPlayer1Discard,
    setPlayer2Discard,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
    setSelectedPokemonCell,
    setSelectedAttackIndex,
  } = context;
  const { boardAfterAttack, amount, attacker, attackName, selectedPokemonCell } = locals;

  const baseDamage = Math.max(0, amount);
  // Dégâts au joueur adverse (talent adverse devant l'attaquant : X dégâts de moins).
  const playerDamage = Math.max(
    0,
    baseDamage - getAttackerColumnDamageReduction(attacker, boardAfterAttack, selectedPokemonCell)
  );
  const opponent: Player = attacker.owner === 1 ? 2 : 1;
  const nextBoard: BoardState = { ...boardAfterAttack };

  const knockedOut: PokemonInPlay[] = [];
  const hitNames: string[] = [];
  const protectedNames: string[] = [];
  let retaliationTotal = 0;
  let burnsAttacker = false;
  const boardBefore: BoardState = { ...nextBoard };

  for (const [cell, pokemon] of Object.entries(nextBoard)) {
    if (!pokemon || pokemon.owner !== opponent) continue;

    // --- Protections complètes ---
    const damagePrevented =
      pokemon.preventAllAttackDamageAndEffects === true ||
      isAttackDamagePreventedByEffect(pokemon, attacker) ||
      doesTemporaryProtectionPreventDamage(pokemon, attacker) ||
      doesTalentPreventDamage(pokemon, attacker);

    // --- Réductions ---
    const damageReduction =
      pokemon.attackDamageReductionEndPlayer === attacker.owner
        ? (pokemon.attackDamageReduction ?? 0)
        : 0;

    const fireWaterReduction = getTalentDamageReduction(pokemon, attacker, boardBefore);

    const damage = damagePrevented
      ? 0
      : Math.max(
          0,
          baseDamage +
            getTargetTypeBonusDamage(locals.effects, pokemon) -
            damageReduction -
            fireWaterReduction
        );

    if (damage <= 0) {
      protectedNames.push(pokemon.card.name);
      continue;
    }

    retaliationTotal += getRetaliationDamage(pokemon, attacker, damage, boardBefore, cell);
    if (doesTalentBurnAttacker(pokemon, cell, boardBefore, attacker, damage)) {
      burnsAttacker = true;
    }

    const hpAfterDamage = pokemon.currentHp - damage;
    hitNames.push(`${pokemon.card.name} (-${damage})`);

    if (hpAfterDamage > 0) {
      nextBoard[cell] = { ...pokemon, currentHp: hpAfterDamage };
    } else {
      nextBoard[cell] = null;
      knockedOut.push(pokemon);
    }
  }

  // --- Conséquences des K.O. (pénalités, défausse) ---
  const ko = getKnockoutConsequences(knockedOut);

  for (const pokemon of knockedOut) {
    prepareKOEnergyMove(pokemon, nextBoard);
  }

  // Le joueur adverse subit les dégâts + les pénalités de ses Pokémon K.O.
  const setOpponentDamage = opponent === 1 ? setPlayer1Damage : setPlayer2Damage;
  setOpponentDamage((previous) => previous + playerDamage + ko.penalty);

  if (ko.discardedCards.length > 0) {
    const setOpponentDiscard = opponent === 1 ? setPlayer1Discard : setPlayer2Discard;
    const setOpponentDiscardEnergies =
      opponent === 1 ? setPlayer1DiscardEnergies : setPlayer2DiscardEnergies;

    setOpponentDiscard((previous) => [...previous, ...ko.discardedCards]);
    setOpponentDiscardEnergies((previous) => [...previous, ...ko.discardedEnergies]);
  }

  // Contre-coup éventuel, puis K.O. de l'attaquant (confusion ou contre-coup).
  const attackerBefore = nextBoard[selectedPokemonCell];
  if (attackerBefore && retaliationTotal > 0) {
    nextBoard[selectedPokemonCell] = {
      ...attackerBefore,
      currentHp: attackerBefore.currentHp - retaliationTotal,
    };
  }

  const attackerToBurn = nextBoard[selectedPokemonCell];
  if (burnsAttacker && attackerToBurn) {
    nextBoard[selectedPokemonCell] = burnAttackingPokemon(attackerToBurn);
  }

  const attackerNow = nextBoard[selectedPokemonCell];
  const attackerKO = attackerNow
    ? handleAttackerKO(nextBoard, attackerNow, selectedPokemonCell)
    : false;

  setBoard(nextBoard);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `${attacker.card.name} utilise ${attackName} : ${playerDamage} dégâts au joueur ${opponent}` +
      (hitNames.length > 0 ? ` et à ${hitNames.join(', ')}` : '') +
      '.' +
      (protectedNames.length > 0
        ? ` ${protectedNames.join(', ')} ${protectedNames.length > 1 ? 'sont protégés' : 'est protégé'}.`
        : '') +
      (knockedOut.length > 0
        ? ` K.O. : ${knockedOut.map((pokemon) => pokemon.card.name).join(', ')} (+${ko.penalty} dégâts au joueur ${opponent}).`
        : '') +
      (retaliationTotal > 0
        ? ` Contre-coup : ${attacker.card.name} reçoit ${retaliationTotal / 10} marqueurs de dégâts (${retaliationTotal}).`
        : '') +
      (burnsAttacker && attackerToBurn ? ` ${attacker.card.name} est maintenant Brûlé par un Talent !` : '') +
      (attackerKO ? ` ${attacker.card.name} est K.O. !` : '')
  );
}
