/**
 * API des comptes joueurs.
 *
 *   POST /api/register   { pseudo, password, email?, avatar? }  -> { token, player }
 *   POST /api/login      { pseudo, password }                   -> { token, player }
 *   GET  /api/me         (Authorization: Bearer <token>)        -> { player }
 *   POST /api/logout     (Authorization: Bearer <token>)        -> { ok: true }
 *   GET  /api/health                                            -> { ok: true }
 */
require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');

const PORT = Number(process.env.PORT) || 3001;
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 10;

const PSEUDO_RE = /^[A-Za-z0-9_-]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_RE = /^card:[A-Za-z0-9-]{1,50}$/;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'app-pokemon-ghuart9207-4d09.g.aivencloud.com',
  port: Number(process.env.DB_PORT) || 15418,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_5lE__2Qf-DBXHRQBqlZ',
  database: process.env.DB_NAME || 'pokemon_tcg_plateau',
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

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Non connecté.' });

    const [rows] = await pool.execute(
      `SELECT p.* FROM sessions s
         JOIN players p ON p.id = s.player_id
        WHERE s.token_hash = ? AND s.expires_at > NOW() AND p.is_active = TRUE`,
      [sha256(token)]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Session expirée, reconnecte-toi.' });

    req.player = rows[0];
    req.tokenHash = sha256(token);
    next();
  } catch (error) {
    next(error);
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
        return res
          .status(409)
          .json({
            error: emailTaken
              ? 'Cet email est déjà utilisé.'
              : 'Ce pseudo est déjà pris.',
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

  app.listen(PORT, () =>
    console.log(`API des comptes prête sur http://localhost:${PORT}`)
  );
}

start();
