import { useEffect, useRef, useState } from 'react';

import type { GameApi } from '@/features/game/hooks/use-game';

import { applyAction, createOnlineGame, getActiveSeats, getWinner } from './game-actions';
import { useOnline } from './online-context';
import type { ActionName, Seat } from './protocol';

const NOTICE_DURATION_MS = 2500;

/**
 * Rend un jeu local synchronisé avec l'adversaire.
 *
 * Fonctionnement : un clic n'agit pas directement. Il est envoyé au serveur, qui le renvoie aux
 * deux joueurs avec un numéro d'ordre. Chaque écran applique ensuite les actions une par une,
 * en attendant que l'écran soit à jour entre deux actions. Comme le jeu n'utilise aucun hasard,
 * les deux écrans restent identiques.
 */
export function useOnlineGame(rawGame: GameApi, you: Seat) {
  const online = useOnline();
  const { log, isAwaitingEcho, sendAction, reportGameOver } = online;

  const [appliedCount, setAppliedCount] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const appliedRef = useRef(0);
  const lastRunRef = useRef('');
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportedRef = useRef(false);

  // Applique UNE action du journal par rendu, avec l'état le plus récent du jeu.
  useEffect(() => {
    // protège contre le double appel des effets en mode développement
    const runKey = `${appliedCount}:${log.length}`;
    if (lastRunRef.current === runKey) return;
    lastRunRef.current = runKey;

    if (appliedRef.current >= log.length) return;

    const action = log[appliedRef.current];
    appliedRef.current += 1;

    try {
      applyAction(action, rawGame);
    } catch (error) {
      console.warn('Action en ligne ignorée :', action.name, error);
    }

    // On passe à l'action suivante au tour d'après (et pas tout de suite) : l'écran a ainsi le temps
    // de se mettre à jour, et rejouer une longue partie ne crée pas une chaîne de rendus imbriqués.
    const applied = appliedRef.current;
    nextTimerRef.current = setTimeout(() => setAppliedCount(applied), 0);
  });

  // Quand la partie se termine, on annonce le gagnant (le serveur compare avec l'autre joueur).
  useEffect(() => {
    if (rawGame.gameOver && !reportedRef.current) {
      reportedRef.current = true;
      reportGameOver(getWinner(rawGame));
    }
    if (!rawGame.gameOver) reportedRef.current = false;
  });

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, []);

  const isSynchronizing = appliedCount < log.length;
  const canAct = getActiveSeats(rawGame).includes(you);

  function showNotice(message: string) {
    setNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
  }

  function send(name: ActionName, payload: unknown[]) {
    // On peut abandonner à tout moment, même pendant le tour adverse.
    if (!canAct && name !== 'forfeit') {
      showNotice("Ce n'est pas à toi de jouer.");
      return;
    }
    if (isSynchronizing || isAwaitingEcho) {
      showNotice('Synchronisation en cours…');
      return;
    }
    sendAction(name, payload);
  }

  return {
    game: createOnlineGame(rawGame, send),
    notice,
    canAct,
  };
}
