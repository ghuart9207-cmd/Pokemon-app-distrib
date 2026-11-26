/**
 * Serveur temps réel (WebSocket) : salons et synchronisation des actions de jeu.
 *
 * Client -> serveur
 *   { type: 'auth', token }
 *   { type: 'create_room', series }       series : 'soleil-lune' ou 'tcg-pocket'
 *   { type: 'join_room', code, series }   refusé si la série n'est pas celle de l'hôte
 *   { type: 'leave_room' }
 *   { type: 'action', name, payload }     une action de jeu (clic, attaque, fin de tour…)
 *   { type: 'game_over', winner, scores?, cards? }
 *                                         winner : 1, 2 ou 0 (égalité)
 *                                         scores : [dégâts infligés par le joueur 1, par le joueur 2]
 *                                         cards  : { 1: [id des Pokémon], 2: [...] } (journal de combat)
 *
 * Serveur -> client
 *   { type: 'authed', player }
 *   { type: 'room_joined', code, series, you, players, log }
 *   { type: 'room_update', players }
 *   { type: 'action', seq, from, name, payload }   envoyée aux DEUX joueurs, dans le même ordre
 *   { type: 'match_recorded' }
 *   { type: 'presence', players }   joueurs connectés : [{ id, pseudo, inGame }]
 *   { type: 'error', code, message }
 *
 * Le serveur ne connaît pas les règles : il ordonne les actions et les retransmet.
 */
const { WebSocketServer } = require('ws');
const { createRoomManager, RoomError } = require('./rooms');

const AUTH_TIMEOUT_MS = 10_000;
const HEARTBEAT_MS = 30_000;
const MAX_PAYLOAD_BYTES = 16 * 1024;
const MAX_MESSAGES_PER_SECOND = 40;

// Les seules actions acceptées : celles de l'écran de jeu
const ACTION_NAMES = new Set([
  'cell',
  'hand',
  'target',
  'tool',
  'koEnergy',
  'invocationSelect',
  'selectAttack',
  'attack',
  'retreat',
  'trainer',
  'invocationSupporter',
  'endTurn',
  'trainerCoin',
  'coinSide',
  'validateCoin',
  'victorious',
  'talent',
  'optionalDiscard',
  'discardAllChoice',
  'optionalBonusChoice',
  'ownBenchTarget',
  'optionalEffectChoice',
  'discardSummonSelect',
  'energyGatherDone',
  'forfeit',
  'restart',
  'restartSame',
  'setupToggle',
  'setupConfirm',
  'invAdd',
  'invRemove',
  'invConfirm',
]);

function attachRealtime(httpServer, { authenticate, recordMatch }) {
  const manager = createRoomManager();
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
    maxPayload: MAX_PAYLOAD_BYTES,
  });

  const send = (socket, message) => {
    if (socket && socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
  };
  const sendError = (socket, code, message) =>
    send(socket, { type: 'error', code, message });

  function broadcast(room, message) {
    for (const seat of [1, 2]) {
      const s = room.seats[seat];
      if (s && s.socket) send(s.socket, message);
    }
  }

  // ---------------------------------------------
  // JOUEURS CONNECTÉS (présence)
  // playerId -> { pseudo, sessions } ; une session par connexion ouverte.
  // ---------------------------------------------
  const presence = new Map();

  function presenceList() {
    return [...presence.entries()]
      .map(([id, entry]) => ({
        id,
        pseudo: entry.pseudo,
        // en partie si l'une de ses connexions est dans un salon
        inGame: [...entry.sessions].some((s) => s.code !== null),
      }))
      .sort((a, b) => a.pseudo.localeCompare(b.pseudo));
  }

  function broadcastPresence() {
    const message = { type: 'presence', players: presenceList() };
    for (const client of wss.clients) {
      if (client.authed) send(client, message);
    }
  }

  function addPresence(session) {
    const id = session.player.id;
    const entry = presence.get(id) || { pseudo: session.player.pseudo, sessions: new Set() };
    entry.pseudo = session.player.pseudo;
    entry.sessions.add(session);
    presence.set(id, entry);
    broadcastPresence();
  }

  function removePresence(session) {
    if (!session.player) return;
    const entry = presence.get(session.player.id);
    if (!entry) return;
    entry.sessions.delete(session);
    if (entry.sessions.size === 0) presence.delete(session.player.id);
    broadcastPresence();
  }

  function bindSeat(room, seat, socket) {
    const previous = room.seats[seat].socket;
    room.seats[seat].socket = socket;
    room.seats[seat].connected = true;
    // une seule connexion par joueur : l'ancienne (ancien onglet) est fermée
    if (previous && previous !== socket) previous.close(4000, 'Connecté ailleurs');
  }

  wss.on('connection', (socket) => {
    const session = { player: null, code: null, windowStart: Date.now(), count: 0 };
    socket.isAlive = true;
    socket.on('pong', () => (socket.isAlive = true));

    const authTimer = setTimeout(() => {
      if (!session.player) socket.close(4001, 'Authentification requise');
    }, AUTH_TIMEOUT_MS);

    socket.on('message', async (raw) => {
      // limite de débit
      const now = Date.now();
      if (now - session.windowStart > 1000) {
        session.windowStart = now;
        session.count = 0;
      }
      if (++session.count > MAX_MESSAGES_PER_SECOND)
        return socket.close(1008, 'Trop de messages');

      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return sendError(socket, 'BAD_MESSAGE', 'Message invalide.');
      }
      if (!msg || typeof msg.type !== 'string')
        return sendError(socket, 'BAD_MESSAGE', 'Message invalide.');

      try {
        if (msg.type === 'auth') {
          const player = await authenticate(msg.token);
          if (!player) {
            sendError(socket, 'UNAUTHORIZED', 'Session expirée, reconnecte-toi.');
            return socket.close(4001, 'Non autorisé');
          }
          // déjà identifié sur cette connexion : on retire l'ancienne présence
          if (session.player) removePresence(session);
          session.player = player;
          socket.authed = true;
          clearTimeout(authTimer);
          send(socket, {
            type: 'authed',
            player: { id: player.id, pseudo: player.pseudo },
          });
          addPresence(session);
          return;
        }

        if (!session.player)
          return sendError(socket, 'UNAUTHORIZED', 'Connexion requise.');

        switch (msg.type) {
          case 'create_room':
          case 'join_room': {
            const result =
              msg.type === 'create_room'
                ? manager.createRoom(session.player, msg.series)
                : manager.joinRoom(msg.code, session.player, msg.series);
            const { room, seat } = result;
            bindSeat(room, seat, socket);
            session.code = room.code;
            send(socket, {
              type: 'room_joined',
              code: room.code,
              series: room.series,
              you: seat,
              players: manager.playersInfo(room),
              log: room.log,
            });
            // l'autre joueur est prévenu (arrivée, retour)
            broadcast(room, { type: 'room_update', players: manager.playersInfo(room) });
            broadcastPresence();
            return;
          }

          case 'leave_room': {
            const room = manager.leaveRoom(session.player.id);
            session.code = null;
            broadcastPresence();
            if (room && !room.closed)
              broadcast(room, {
                type: 'room_update',
                players: manager.playersInfo(room),
              });
            if (room && room.closed) {
              for (const seat of [1, 2]) {
                const s = room.seats[seat];
                if (s && s.socket && s.socket !== socket)
                  sendError(s.socket, 'ROOM_CLOSED', "L'hôte a quitté la partie.");
              }
            }
            return;
          }

          case 'action': {
            const room = session.code && manager.getRoom(session.code);
            const seat = room && manager.seatOf(room, session.player.id);
            if (!room || !seat)
              return sendError(socket, 'NO_ROOM', "Tu n'es dans aucune partie.");
            if (!room.seats[1] || !room.seats[2]) {
              return sendError(
                socket,
                'WAITING',
                "L'adversaire n'est pas encore arrivé."
              );
            }
            if (!ACTION_NAMES.has(msg.name) || !Array.isArray(msg.payload)) {
              return sendError(socket, 'BAD_ACTION', 'Action inconnue.');
            }
            const entry = manager.appendAction(room, seat, msg.name, msg.payload);
            broadcast(room, { type: 'action', ...entry });
            return;
          }

          case 'game_over': {
            const room = session.code && manager.getRoom(session.code);
            const seat = room && manager.seatOf(room, session.player.id);
            if (!room || !seat || room.log.length === 0) return;
            if (![0, 1, 2].includes(msg.winner)) return;

            room.reports[seat] = msg.winner;
            // détails pour le journal de combat (le 1er envoyé suffit : les deux écrans sont identiques)
            if (!room.details && (msg.scores || msg.cards)) {
              room.details = { scores: msg.scores, cards: msg.cards };
            }
            const bothAgree =
              room.reports[1] !== undefined && room.reports[1] === room.reports[2];
            if (bothAgree && !room.recorded) {
              room.recorded = true; // une seule fois par partie
              try {
                await recordMatch({
                  player1Id: room.seats[1].playerId,
                  player2Id: room.seats[2].playerId,
                  winnerSeat: room.reports[1],
                  startedAt: room.createdAt,
                  details: room.details || {},
                });
                broadcast(room, { type: 'match_recorded' });
              } catch (error) {
                room.recorded = false;
                console.error('Enregistrement de la partie impossible :', error.message);
              }
            }
            return;
          }

          default:
            return sendError(socket, 'BAD_MESSAGE', 'Message inconnu.');
        }
      } catch (error) {
        if (error instanceof RoomError)
          return sendError(socket, error.code, error.message);
        console.error('Erreur WebSocket :', error);
        sendError(socket, 'SERVER_ERROR', 'Erreur du serveur.');
      }
    });

    socket.on('close', () => {
      clearTimeout(authTimer);
      removePresence(session);
      if (!session.player || !session.code) return;
      const room = manager.getRoom(session.code);
      if (!room) return;
      const seat = manager.seatOf(room, session.player.id);
      // on ne marque « déconnecté » que si c'est bien la connexion courante de ce siège
      if (seat && room.seats[seat].socket === socket) {
        room.seats[seat].connected = false;
        room.seats[seat].socket = null;
        broadcast(room, { type: 'room_update', players: manager.playersInfo(room) });
      }
    });
  });

  // Détection des connexions mortes + nettoyage des salons abandonnés
  const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
      if (!socket.isAlive) {
        socket.terminate();
        continue;
      }
      socket.isAlive = false;
      socket.ping();
    }
    manager.removeIdleRooms();
  }, HEARTBEAT_MS);
  heartbeat.unref();

  return { wss, manager };
}

module.exports = { attachRealtime, ACTION_NAMES };
