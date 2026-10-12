/**
 * API des comptes joueurs.
 *
 *   POST /api/register   { pseudo, password, email?, avatar? }  -> { token, player }
 *   POST /api/login      { pseudo, password }                   -> { token, player }
 *   GET  /api/me         (Authorization: Bearer <token>)        -> { player }
 *   POST /api/logout     (Authorization: Bearer <token>)        -> { ok: true }
 *   GET  /api/health                                            -> { ok: true }
 *
 * + le serveur temps réel (WebSocket sur /ws) défini dans realtime.js.
 */
require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const { attachRealtime } = require('./realtime');

const PORT = Number(process.env.PORT) || 3001;
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 10;

const PSEUDO_RE = /^[A-Za-z0-9_-]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_RE = /^card:[A-Za-z0-9-]{1,50}$/;

/**
 * Configuration de la base. Deux façons de la définir :
 *  - DATABASE_URL=mysql://utilisateur:motdepasse@hote:port/base   (ce que donnent les hébergeurs)
 *  - ou les variables séparées DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 * Pour une base hébergée en ligne, la connexion doit être chiffrée : DB_SSL=true
 * (et DB_SSL_CA=ca.pem si l'hébergeur fournit un certificat à télécharger).
 */
function buildDatabaseConfig() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pokemon_tcg_plateau',
  };
  let useSsl = process.env.DB_SSL === 'true';

  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    config.host = url.hostname;
    config.port = Number(url.port) || 3306;
    config.user = decodeURIComponent(url.username);
    config.password = decodeURIComponent(url.password);
    config.database =
      decodeURIComponent(url.pathname.replace(/^\//, '')) || config.database;
    if (url.searchParams.has('ssl-mode') || url.searchParams.has('ssl')) useSsl = true;
  }

  if (useSsl) {
    config.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      ...(process.env.DB_SSL_CA ? { ca: fs.readFileSync(process.env.DB_SSL_CA) } : {}),
    };
  }

  return config;
}

const pool = mysql.createPool({
  ...buildDatabaseConfig(),
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
});

// Hash factice : permet de comparer un mot de passe même si le pseudo n'existe pas,
// pour que le temps de réponse ne révèle pas quels pseudos existent.
const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', BCRYPT_ROUNDS);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

/** Ce que le serveur renvoie au jeu : jamais le hash du mot de passe. */
function toPublicPlayer(row, { withEmail = false } = {}) {
  const player = {
    id: row.id,
    pseudo: row.pseudo,
    avatarUrl: row.avatar_url,
    gamesPlayed: row.games_played,
    wins: row.wins,
    losses: row.losses,
    elo: row.elo,
    createdAt: row.created_at,
  };
  if (withEmail) player.email = row.email;
  return player;
}

async function createSession(playerId) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.execute(
    'INSERT INTO sessions (player_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
    [playerId, sha256(token), SESSION_DAYS]
  );
  return token;
}

/** Joueur correspondant à un jeton de session valide, ou null. */
async function authenticateToken(token) {
  if (typeof token !== 'string' || !token) return null;

  const [rows] = await pool.execute(
    `SELECT p.* FROM sessions s
       JOIN players p ON p.id = s.player_id
      WHERE s.token_hash = ? AND s.expires_at > NOW() AND p.is_active = TRUE`,
    [sha256(token)]
  );
  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Non connecté.' });

    const player = await authenticateToken(token);
    if (!player)
      return res.status(401).json({ error: 'Session expirée, reconnecte-toi.' });

    req.player = player;
    req.tokenHash = sha256(token);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Enregistre une partie terminée : historique (matches) + statistiques et ELO des deux joueurs.
 * winnerSeat : 1 ou 2 pour le gagnant, 0 pour une égalité.
 */
const ELO_K = 32;

async function recordMatch({ player1Id, player2Id, winnerSeat, startedAt }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT id, elo FROM players WHERE id IN (?, ?) FOR UPDATE',
      [player1Id, player2Id]
    );
    const elo = Object.fromEntries(rows.map((row) => [row.id, row.elo]));

    const score1 = winnerSeat === 1 ? 1 : winnerSeat === 2 ? 0 : 0.5;
    const expected1 = 1 / (1 + 10 ** ((elo[player2Id] - elo[player1Id]) / 400));
    const newElo1 = Math.max(
      0,
      Math.round(elo[player1Id] + ELO_K * (score1 - expected1))
    );
    const newElo2 = Math.max(
      0,
      Math.round(elo[player2Id] + ELO_K * (1 - score1 - (1 - expected1)))
    );

    const winnerId = winnerSeat === 1 ? player1Id : winnerSeat === 2 ? player2Id : null;
    await connection.execute(
      `INSERT INTO matches (player1_id, player2_id, winner_id, rounds_played, started_at, ended_at)
       VALUES (?, ?, ?, 8, FROM_UNIXTIME(?), NOW())`,
      [player1Id, player2Id, winnerId, Math.floor(startedAt / 1000)]
    );

    const update = `UPDATE players
                       SET games_played = games_played + 1,
                           wins = wins + ?, losses = losses + ?, elo = ?
                     WHERE id = ?`;
    await connection.execute(update, [
      winnerSeat === 1 ? 1 : 0,
      winnerSeat === 2 ? 1 : 0,
      newElo1,
      player1Id,
    ]);
    await connection.execute(update, [
      winnerSeat === 2 ? 1 : 0,
      winnerSeat === 1 ? 1 : 0,
      newElo2,
      player2Id,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------
const app = express();
app.use(cors()); // en développement : toutes les origines. À restreindre en production.
app.use(express.json({ limit: '10kb' }));

// Anti brute-force : 30 tentatives par quart d'heure et par adresse IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessaie dans quelques minutes.' },
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/register', authLimiter, async (req, res, next) => {
  try {
    const { pseudo, password, email, avatar } = req.body || {};

    if (typeof pseudo !== 'string' || !PSEUDO_RE.test(pseudo)) {
      return res.status(400).json({
        error: 'Le pseudo doit faire 3 à 20 caractères (lettres, chiffres, _ ou -).',
      });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return res
        .status(400)
        .json({ error: 'Le mot de passe doit faire entre 8 et 72 caractères.' });
    }
    // Une adresse vide est enregistrée comme NULL (sinon deux comptes sans email entreraient en conflit).
    const cleanEmail = typeof email === 'string' && email.trim() ? email.trim() : null;
    if (cleanEmail && (cleanEmail.length > 255 || !EMAIL_RE.test(cleanEmail))) {
      return res.status(400).json({ error: "L'adresse email n'est pas valide." });
    }
    if (avatar !== undefined && avatar !== null && !AVATAR_RE.test(avatar)) {
      return res.status(400).json({ error: "L'image de profil n'est pas valide." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let playerId;
    try {
      const [result] = avatar
        ? await pool.execute(
            'INSERT INTO players (pseudo, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
            [pseudo, cleanEmail, passwordHash, avatar]
          )
        : await pool.execute(
            'INSERT INTO players (pseudo, email, password_hash) VALUES (?, ?, ?)',
            [pseudo, cleanEmail, passwordHash]
          );
      playerId = result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const emailTaken = String(error.sqlMessage).includes('uq_players_email');
        return res.status(409).json({
          error: emailTaken ? 'Cet email est déjà utilisé.' : 'Ce pseudo est déjà pris.',
        });
      }
      throw error;
    }

    const [rows] = await pool.execute('SELECT * FROM players WHERE id = ?', [playerId]);
    const token = await createSession(playerId);
    res.status(201).json({ token, player: toPublicPlayer(rows[0], { withEmail: true }) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/login', authLimiter, async (req, res, next) => {
  try {
    const { pseudo, password } = req.body || {};
    if (typeof pseudo !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Pseudo et mot de passe requis.' });
    }

    const [rows] = await pool.execute('SELECT * FROM players WHERE pseudo = ?', [pseudo]);
    const player = rows[0];

    const passwordOk = await bcrypt.compare(
      password,
      player ? player.password_hash : DUMMY_HASH
    );
    if (!player || !passwordOk) {
      return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect.' });
    }
    if (!player.is_active) {
      return res.status(403).json({ error: 'Ce compte est désactivé.' });
    }

    await pool.execute('UPDATE players SET last_login_at = NOW() WHERE id = ?', [
      player.id,
    ]);
    const token = await createSession(player.id);
    res.json({ token, player: toPublicPlayer(player, { withEmail: true }) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ player: toPublicPlayer(req.player, { withEmail: true }) });
});

app.post('/api/logout', requireAuth, async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM sessions WHERE token_hash = ?', [req.tokenHash]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Requête invalide.' });
  }
  console.error(error);
  res.status(500).json({ error: 'Erreur du serveur.' });
});

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------
async function purgeExpiredSessions() {
  try {
    await pool.execute('DELETE FROM sessions WHERE expires_at < NOW()');
  } catch (error) {
    console.error('Purge des sessions impossible :', error.message);
  }
}

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.error(
      `\nImpossible de se connecter à MySQL (${error.code || error.message}).\n` +
        '  - Le serveur MySQL est-il démarré ?\n' +
        '  - Le fichier database.sql a-t-il été importé ?\n' +
        '  - Les identifiants du fichier .env sont-ils corrects ?\n'
    );
    process.exit(1);
  }

  await purgeExpiredSessions();
  setInterval(purgeExpiredSessions, 60 * 60 * 1000).unref();

  const server = app.listen(PORT, () => {
    console.log(`API des comptes prête sur http://localhost:${PORT}`);
    console.log(`Parties en ligne (WebSocket) sur ws://localhost:${PORT}/ws`);
  });
  attachRealtime(server, { authenticate: authenticateToken, recordMatch });
}

start();
