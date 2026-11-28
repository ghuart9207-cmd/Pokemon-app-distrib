/**
 * SYSTÈME D'ELO (parties classées uniquement)
 *
 * Le tableau donne, selon l'ELO du joueur (par tranche de 100), ce qu'il gagne ou perd
 * pour une partie gagnée / perdue avec 100 dégâts d'écart, et ce qu'il gagne en cas d'égalité.
 *
 * 1) Écart de dégâts (victoire et défaite) :
 *    5 % de plus ou de moins par tranche de 10 dégâts au-dessus ou en dessous de 100.
 *    ex : 90 dégâts d'écart → 95 % ; 130 → 115 %.
 *    Plafond : 200 dégâts d'écart (150 %). Abandon : compté comme 200 dégâts d'écart.
 * 2) Écart d'ELO (victoire et égalité, PAS la défaite) :
 *    10 % de moins par tranche de 100 d'ELO que l'adversaire a en moins,
 *    10 % de plus par tranche de 100 qu'il a en plus.
 *    ex : 1000 bat 900 → 90 % ; 100 fait égalité contre 1000 → 190 %.
 * 3) Arrondi à l'entier le plus proche ; pile au milieu (x,5), vers le haut :
 *    28,5 → 29 ; -9,5 → -9.
 *
 * Pour changer les valeurs, modifie seulement ELO_TABLE ou les pourcentages ci-dessous.
 */

/** ELO (début de tranche) → { win, loss, draw } pour 100 dégâts d'écart. */
const ELO_TABLE = [
  { elo: 100, win: 30, loss: 10, draw: 10 },
  { elo: 200, win: 27, loss: 11, draw: 9 },
  { elo: 300, win: 24, loss: 12, draw: 8 },
  { elo: 400, win: 21, loss: 13, draw: 7 },
  { elo: 500, win: 18, loss: 14, draw: 6 },
  { elo: 600, win: 15, loss: 15, draw: 5 },
  { elo: 700, win: 14, loss: 14, draw: 5 },
  { elo: 800, win: 12, loss: 13, draw: 4 },
  { elo: 900, win: 11, loss: 12, draw: 4 },
  { elo: 1000, win: 9, loss: 11, draw: 3 },
];

/** ELO de départ de tous les joueurs. */
const STARTING_ELO = 100;
/** Écart de dégâts de référence (celui du tableau). */
const REFERENCE_DAMAGE_DIFF = 100;
/** Écart de dégâts maximal pris en compte (et celui utilisé en cas d'abandon). */
const MAX_DAMAGE_DIFF = 200;
/** +/- 5 % par tranche de 10 dégâts. */
const DAMAGE_STEP = 10;
const DAMAGE_STEP_PERCENT = 0.05;
/** +/- 10 % par tranche de 100 d'ELO d'écart avec l'adversaire. */
const ELO_STEP = 100;
const ELO_STEP_PERCENT = 0.1;

/** Ligne du tableau : en dessous de 100 → ligne 100 ; au-dessus de 1000 → ligne 1000. */
function tableRow(elo) {
  let row = ELO_TABLE[0];
  for (const candidate of ELO_TABLE) {
    if (elo >= candidate.elo) row = candidate;
  }
  return row;
}

/** Arrondi à l'entier le plus proche, x,5 vers le haut (-9,5 → -9). */
function roundElo(value) {
  // (on nettoie d'abord les erreurs de calcul des décimales, ex : 28,4999999 → 28,5)
  const clean = Math.round(value * 1e6) / 1e6;
  return Math.floor(clean + 0.5);
}

/** Coefficient lié à l'écart de dégâts (jamais négatif). */
function damageFactor(damageDiff) {
  const diff = Math.min(Math.abs(damageDiff), MAX_DAMAGE_DIFF);
  const steps = Math.floor(diff / DAMAGE_STEP) - REFERENCE_DAMAGE_DIFF / DAMAGE_STEP;
  return Math.max(0, 1 + steps * DAMAGE_STEP_PERCENT);
}

/** Coefficient lié à l'écart d'ELO : tranches complètes de 100 (jamais négatif). */
function eloFactor(myElo, opponentElo) {
  const steps = Math.trunc((opponentElo - myElo) / ELO_STEP);
  return Math.max(0, 1 + steps * ELO_STEP_PERCENT);
}

/**
 * Variation d'ELO d'un joueur.
 * result : 'win' | 'loss' | 'draw'
 */
function eloChange(result, myElo, opponentElo, damageDiff) {
  const row = tableRow(myElo);
  if (result === 'win') return roundElo(row.win * damageFactor(damageDiff) * eloFactor(myElo, opponentElo));
  if (result === 'loss') return roundElo(-row.loss * damageFactor(damageDiff));
  return roundElo(row.draw * eloFactor(myElo, opponentElo));
}

/**
 * Nouveaux ELO des deux joueurs.
 * winnerSeat : 1, 2 ou 0 (égalité) ; damageDiff : écart de dégâts entre les deux joueurs.
 */
function computeElo({ elo1, elo2, winnerSeat, damageDiff }) {
  const result1 = winnerSeat === 1 ? 'win' : winnerSeat === 2 ? 'loss' : 'draw';
  const result2 = winnerSeat === 2 ? 'win' : winnerSeat === 1 ? 'loss' : 'draw';
  return {
    newElo1: Math.max(0, elo1 + eloChange(result1, elo1, elo2, damageDiff)),
    newElo2: Math.max(0, elo2 + eloChange(result2, elo2, elo1, damageDiff)),
  };
}

module.exports = { computeElo, eloChange, STARTING_ELO, MAX_DAMAGE_DIFF };
