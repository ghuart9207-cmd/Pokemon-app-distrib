import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/features/auth/auth-context';
import { WS_URL } from '@/features/auth/config';

import { toCardSeries } from '@/features/game/data';
import type { CardSeries } from '@/features/game/types';

import type { ActionName, OnlineAction, RoomState, ServerMessage } from './protocol';

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting';

type OnlineContextValue = {
  status: ConnectionStatus;
  /** Salon dans lequel on se trouve, ou null. */
  room: RoomState | null;
  /** Journal de toutes les actions de la partie, dans l'ordre du serveur. */
  log: OnlineAction[];
  /** Dernière erreur à afficher au joueur. */
  error: string | null;
  /** Vrai entre l'envoi d'une action et le moment où le serveur la renvoie. */
  isAwaitingEcho: boolean;
  /** Crée un salon pour la série choisie. */
  createRoom: (series: CardSeries) => Promise<void>;
  /** Rejoint un salon : la série doit être la même que celle de l'hôte. */
  joinRoom: (code: string, series: CardSeries) => Promise<void>;
  leaveRoom: () => void;
  /** Envoie une action de jeu. Renvoie false si elle n'a pas pu partir. */
  sendAction: (name: ActionName, payload: unknown[]) => boolean;
  /** Annonce la fin de la partie (winner : 1, 2 ou 0 pour une égalité). */
  reportGameOver: (winner: 0 | 1 | 2) => void;
  clearError: () => void;
};

const OnlineContext = createContext<OnlineContextValue | null>(null);

const CONNECT_TIMEOUT_MS = 8000;
const ECHO_TIMEOUT_MS = 3000;
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 5000, 5000, 5000];

type PendingRequest = { resolve: () => void; reject: (error: Error) => void };

/**
 * Connexion temps réel : salons, envoi des actions et réception du journal de la partie.
 * Si la connexion se coupe pendant une partie, elle est rétablie automatiquement
 * et le journal est renvoyé par le serveur.
 */
export function OnlineProvider({ children }: { children: ReactNode }) {
  const { token, refreshPlayer } = useAuth();

  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [log, setLog] = useState<OnlineAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAwaitingEcho, setIsAwaitingEcho] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const logRef = useRef<OnlineAction[]>([]);
  const roomRef = useRef<RoomState | null>(null);
  const roomCodeRef = useRef<string | null>(null);
  const requestRef = useRef<PendingRequest | null>(null);
  const authWaiterRef = useRef<PendingRequest | null>(null);
  const echoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);
  const refreshPlayerRef = useRef(refreshPlayer);

  useEffect(() => {
    refreshPlayerRef.current = refreshPlayer;
  });

  function clearEchoWait() {
    if (echoTimerRef.current) clearTimeout(echoTimerRef.current);
    echoTimerRef.current = null;
    setIsAwaitingEcho(false);
  }

  function sendRaw(message: object): boolean {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(message));
    return true;
  }

  function resetRoom() {
    roomCodeRef.current = null;
    roomRef.current = null;
    logRef.current = [];
    setRoom(null);
    setLog([]);
    clearEchoWait();
  }

  function handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'authed':
        authWaiterRef.current?.resolve();
        authWaiterRef.current = null;
        break;

      case 'room_joined': {
        const joined: RoomState = {
          code: message.code,
          // ancien serveur sans série : Soleil et Lune par défaut
          series: toCardSeries(message.series),
          you: message.you,
          players: message.players,
        };
        roomCodeRef.current = message.code;
        roomRef.current = joined;
        logRef.current = message.log;
        setRoom(joined);
        setLog(message.log);
        requestRef.current?.resolve();
        requestRef.current = null;
        break;
      }

      case 'room_update':
        if (roomRef.current) {
          roomRef.current = { ...roomRef.current, players: message.players };
          setRoom(roomRef.current);
        }
        break;

      case 'action': {
        const expected = logRef.current.length + 1;
        if (message.seq === expected) {
          const { seq, from, name, payload } = message;
          logRef.current = [...logRef.current, { seq, from, name, payload }];
          setLog(logRef.current);
        } else if (message.seq > expected && roomCodeRef.current) {
          // une action a été manquée : on redemande tout le journal
          sendRaw({ type: 'join_room', code: roomCodeRef.current });
        }
        if (roomRef.current && message.from === roomRef.current.you) clearEchoWait();
        break;
      }

      case 'match_recorded':
        refreshPlayerRef.current();
        break;

      case 'error':
        if (message.code === 'ROOM_CLOSED') resetRoom();
        if (requestRef.current) {
          requestRef.current.reject(new Error(message.message));
          requestRef.current = null;
        } else if (authWaiterRef.current) {
          authWaiterRef.current.reject(new Error(message.message));
          authWaiterRef.current = null;
        } else {
          setError(message.message);
        }
        break;
    }
  }

  /** Ouvre la connexion et s'identifie avec le jeton de la session. */
  function openSocket(): Promise<void> {
    const existing = socketRef.current;
    if (existing && existing.readyState === WebSocket.OPEN) return Promise.resolve();

    if (!token) return Promise.reject(new Error('Connecte-toi pour jouer en ligne.'));

    intentionalCloseRef.current = false;
    setStatus((previous) => (previous === 'reconnecting' ? previous : 'connecting'));

    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      const timer = setTimeout(() => {
        authWaiterRef.current = null;
        socket.close();
        reject(
          new Error(
            'Serveur injoignable. Vérifie que le serveur est lancé (npm start dans le dossier server).'
          )
        );
      }, CONNECT_TIMEOUT_MS);

      authWaiterRef.current = {
        resolve: () => {
          clearTimeout(timer);
          setStatus('open');
          resolve();
        },
        reject: (authError) => {
          clearTimeout(timer);
          reject(authError);
        },
      };

      socket.onopen = () => socket.send(JSON.stringify({ type: 'auth', token }));
      socket.onmessage = (event) => {
        try {
          handleMessage(JSON.parse(String(event.data)) as ServerMessage);
        } catch {
          // message illisible : ignoré
        }
      };
      socket.onerror = () => {
        // le détail arrive dans onclose
      };
      socket.onclose = () => {
        clearTimeout(timer);
        if (socketRef.current === socket) socketRef.current = null;
        if (authWaiterRef.current) {
          authWaiterRef.current.reject(
            new Error(
              'Serveur injoignable. Vérifie que le serveur est lancé (npm start dans le dossier server).'
            )
          );
          authWaiterRef.current = null;
        }
        clearEchoWait();

        if (intentionalCloseRef.current || !roomCodeRef.current) {
          setStatus('idle');
          return;
        }
        scheduleReconnect(0);
      };
    });
  }

  /** Coupure en pleine partie : on retente quelques fois de rejoindre le même salon. */
  function scheduleReconnect(attempt: number) {
    if (attempt >= RECONNECT_DELAYS_MS.length) {
      setStatus('idle');
      setError('Connexion perdue. Retourne au salon et rejoins la partie avec son code.');
      return;
    }

    setStatus('reconnecting');
    reconnectTimerRef.current = setTimeout(async () => {
      try {
        await openSocket();
        await request({ type: 'join_room', code: roomCodeRef.current });
      } catch (reconnectError) {
        const stillThere = roomCodeRef.current !== null;
        if (
          stillThere &&
          reconnectError instanceof Error &&
          /inconnu/i.test(reconnectError.message)
        ) {
          resetRoom();
          setStatus('idle');
          setError("La partie n'existe plus sur le serveur.");
        } else if (stillThere) {
          scheduleReconnect(attempt + 1);
        }
      }
    }, RECONNECT_DELAYS_MS[attempt]);
  }

  /** Envoie une demande qui attend la réponse `room_joined` (ou une erreur). */
  function request(message: object): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      requestRef.current = { resolve, reject };
      if (!sendRaw(message)) {
        requestRef.current = null;
        reject(new Error('Connexion au serveur perdue.'));
      }
    });
  }

  async function createRoom(series: CardSeries) {
    setError(null);
    await openSocket();
    await request({ type: 'create_room', series });
  }

  async function joinRoom(code: string, series: CardSeries) {
    setError(null);
    await openSocket();
    await request({ type: 'join_room', code: code.trim().toUpperCase(), series });
  }

  function leaveRoom() {
    sendRaw({ type: 'leave_room' });
    resetRoom();
  }

  function sendAction(name: ActionName, payload: unknown[]): boolean {
    if (!sendRaw({ type: 'action', name, payload })) {
      setError('Connexion perdue, reconnexion en cours…');
      return false;
    }

    setIsAwaitingEcho(true);
    if (echoTimerRef.current) clearTimeout(echoTimerRef.current);
    // si le serveur ne répond pas, on ne bloque pas le joueur indéfiniment
    echoTimerRef.current = setTimeout(() => setIsAwaitingEcho(false), ECHO_TIMEOUT_MS);
    return true;
  }

  function reportGameOver(winner: 0 | 1 | 2) {
    sendRaw({ type: 'game_over', winner });
  }

  // Déconnexion du compte ou fermeture de l'application : on coupe la connexion temps réel.
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (echoTimerRef.current) clearTimeout(echoTimerRef.current);
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (token) return;

    intentionalCloseRef.current = true;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    socketRef.current?.close();
    socketRef.current = null;
    roomCodeRef.current = null;
    roomRef.current = null;
    logRef.current = [];
    setRoom(null);
    setLog([]);
    setStatus('idle');
  }, [token]);

  return (
    <OnlineContext.Provider
      value={{
        status,
        room,
        log,
        error,
        isAwaitingEcho,
        createRoom,
        joinRoom,
        leaveRoom,
        sendAction,
        reportGameOver,
        clearError: () => setError(null),
      }}
    >
      {children}
    </OnlineContext.Provider>
  );
}

export function useOnline(): OnlineContextValue {
  const context = useContext(OnlineContext);

  if (!context) {
    throw new Error('useOnline doit être utilisé dans un <OnlineProvider>.');
  }

  return context;
}
