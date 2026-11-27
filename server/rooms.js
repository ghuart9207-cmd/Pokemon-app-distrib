/**
 * Gestion des salons de jeu en mémoire (aucune base de données ici).
 * Un salon = une partie à deux joueurs, identifiée par un code à partager.
 * Il garde le journal de toutes les actions : un joueur qui se reconnecte le rejoue pour retrouver la partie.
 */

// Sans I, O, 0, 1 : plus faciles à recopier sans erreur
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 5;
const IDLE_ROOM_TTL_MS = 30 * 60 * 1000;

// Séries de cartes : elles ne se mélangent pas, les deux joueurs doivent avoir la même.
const SERIES_LABELS = {
  'soleil-lune': 'Pokémon Soleil et Lune',
  'tcg-pocket': 'Pokémon TCG Pocket',
};
const DEFAULT_SERIES = 'soleil-lune';

function toSeries(value) {
  return Object.prototype.hasOwnProperty.call(SERIES_LABELS, value) ? value : DEFAULT_SERIES;
}

class RoomError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function createRoomManager() {
  const rooms = new Map(); // code -> salon
  const roomOfPlayer = new Map(); // id du joueur -> code de son salon

  function generateCode() {
    for (let attempt = 0; attempt < 50; attempt++) {
      let code = '';
      for (let i = 0; i < CODE_LENGTH; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
      }
      if (!rooms.has(code)) return code;
    }
    throw new RoomError('NO_CODE', 'Impossible de créer un code de partie.');
  }

  function seatOf(room, playerId) {
    return (
      [1, 2].find((seat) => room.seats[seat] && room.seats[seat].playerId === playerId) ||
      null
    );
  }

  function makeSeat(player) {
    return {
      playerId: player.id,
      pseudo: player.pseudo,
      avatarUrl: player.avatar_url,
      connected: true,
      socket: null,
    };
  }

  function touch(room) {
    room.lastActivity = Date.now();
  }

  /** ranked : partie classée (ELO en jeu) ; false = amicale. */
  function createRoom(player, series, ranked = true) {
    leaveRoom(player.id);

    const room = {
      code: generateCode(),
      series: toSeries(series),
      ranked: ranked !== false,
      seats: { 1: makeSeat(player), 2: null },
      log: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
      reports: {},
      recorded: false,
    };
    rooms.set(room.code, room);
    roomOfPlayer.set(player.id, room.code);
    return { room, seat: 1 };
  }

  function joinRoom(rawCode, player, series, ranked) {
    const room = rooms.get(
      String(rawCode || '')
        .trim()
        .toUpperCase()
    );
    if (!room) throw new RoomError('NOT_FOUND', 'Code de partie inconnu.');

    const existingSeat = seatOf(room, player.id);
    if (existingSeat) {
      // retour d'un joueur déjà dans la partie : il retrouve sa place
      Object.assign(room.seats[existingSeat], {
        pseudo: player.pseudo,
        avatarUrl: player.avatar_url,
        connected: true,
      });
      roomOfPlayer.set(player.id, room.code);
      touch(room);
      return { room, seat: existingSeat, rejoined: true };
    }

    if (room.seats[2]) throw new RoomError('FULL', 'Cette partie est déjà complète.');

    // Nouveau joueur : il doit avoir choisi la même série que l'hôte.
    // (Un joueur qui revient dans sa partie n'est pas concerné : voir plus haut.)
    if (series !== undefined && toSeries(series) !== room.series) {
      throw new RoomError(
        'WRONG_SERIES',
        `Cette partie se joue avec ${SERIES_LABELS[room.series]}. Choisis la même série pour la rejoindre.`
      );
    }

    // Il doit aussi avoir choisi le même mode (classée / amicale).
    if (ranked !== undefined && (ranked !== false) !== room.ranked) {
      throw new RoomError(
        'WRONG_MODE',
        room.ranked
          ? 'Cette partie est classée : choisis « Classée » pour la rejoindre.'
          : 'Cette partie est amicale : choisis « Amicale » pour la rejoindre.'
      );
    }

    leaveRoom(player.id);
    room.seats[2] = makeSeat(player);
    roomOfPlayer.set(player.id, room.code);
    touch(room);
    return { room, seat: 2, rejoined: false };
  }

  /**
   * Un joueur quitte son salon.
   * Avant le début de la partie, sa place est libérée ; ensuite il peut revenir avec le code.
   */
  function leaveRoom(playerId) {
    const code = roomOfPlayer.get(playerId);
    const room = code && rooms.get(code);
    roomOfPlayer.delete(playerId);
    if (!room) return null;

    const seat = seatOf(room, playerId);
    if (!seat) return room;

    if (room.log.length === 0) {
      if (seat === 1) {
        // l'hôte part avant le début : le salon disparaît
        for (const other of [1, 2]) {
          const otherSeat = room.seats[other];
          if (otherSeat) roomOfPlayer.delete(otherSeat.playerId);
        }
        rooms.delete(room.code);
        return { ...room, closed: true };
      }
      room.seats[seat] = null;
    } else {
      room.seats[seat].connected = false;
      room.seats[seat].socket = null;
    }
    touch(room);
    return room;
  }

  function getRoom(code) {
    return rooms.get(code) || null;
  }

  function appendAction(room, seat, name, payload) {
    const entry = { seq: room.log.length + 1, from: seat, name, payload };
    room.log.push(entry);
    touch(room);
    return entry;
  }

  /** Joueurs du salon tels qu'envoyés aux clients (sans socket ni identifiants internes). */
  function playersInfo(room) {
    return [1, 2].map((seat) => {
      const s = room.seats[seat];
      return s
        ? { seat, pseudo: s.pseudo, avatarUrl: s.avatarUrl, connected: s.connected }
        : null;
    });
  }

  function removeIdleRooms(now = Date.now()) {
    for (const [code, room] of rooms) {
      const anyConnected = [1, 2].some(
        (seat) => room.seats[seat] && room.seats[seat].connected
      );
      if (!anyConnected && now - room.lastActivity > IDLE_ROOM_TTL_MS) {
        for (const seat of [1, 2]) {
          const s = room.seats[seat];
          if (s && roomOfPlayer.get(s.playerId) === code) roomOfPlayer.delete(s.playerId);
        }
        rooms.delete(code);
      }
    }
  }

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    seatOf,
    appendAction,
    playersInfo,
    removeIdleRooms,
    roomOfPlayer,
    size: () => rooms.size,
  };
}

module.exports = { createRoomManager, RoomError };
