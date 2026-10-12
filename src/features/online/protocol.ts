/** Messages échangés avec le serveur temps réel (voir server/realtime.js). */

/** Place d'un joueur dans la partie : 1 = celui qui a créé le salon, 2 = celui qui l'a rejoint. */
export type Seat = 1 | 2;

/** Les actions de jeu qui circulent entre les deux joueurs. */
export type ActionName =
  | 'cell'
  | 'hand'
  | 'target'
  | 'tool'
  | 'koEnergy'
  | 'invocationSelect'
  | 'selectAttack'
  | 'attack'
  | 'retreat'
  | 'trainer'
  | 'invocationSupporter'
  | 'endTurn'
  | 'trainerCoin'
  | 'coinSide'
  | 'validateCoin'
  | 'restart'
  | 'restartSame'
  | 'setupToggle'
  | 'setupConfirm'
  | 'invAdd'
  | 'invRemove'
  | 'invConfirm';

/** Une action telle que renvoyée par le serveur, numérotée dans l'ordre d'arrivée. */
export type OnlineAction = {
  seq: number;
  from: Seat;
  name: ActionName;
  payload: unknown[];
};

export type RoomPlayer = {
  seat: Seat;
  pseudo: string;
  avatarUrl: string;
  connected: boolean;
};

export type RoomState = {
  code: string;
  /** Ma place dans la partie. */
  you: Seat;
  /** Les deux places (null = personne). */
  players: [RoomPlayer | null, RoomPlayer | null];
};

export type ServerMessage =
  | { type: 'authed' }
  | {
      type: 'room_joined';
      code: string;
      you: Seat;
      players: [RoomPlayer | null, RoomPlayer | null];
      log: OnlineAction[];
    }
  | { type: 'room_update'; players: [RoomPlayer | null, RoomPlayer | null] }
  | ({ type: 'action' } & OnlineAction)
  | { type: 'match_recorded' }
  | { type: 'error'; code: string; message: string };
