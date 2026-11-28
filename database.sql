-- =============================================================================
--  Pokémon TCG Plateau : base de données des joueurs
--  Compatible MySQL 8+ et MariaDB 10.5+
--
--  Utilisation :   mysql -u root -p < database.sql
--  (ou importer le fichier dans phpMyAdmin / MySQL Workbench)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS pokemon_tcg_plateau
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pokemon_tcg_plateau;


-- -----------------------------------------------------------------------------
--  1. COMPTES DES JOUEURS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS players (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,

  -- Identité
  pseudo         VARCHAR(20)   NOT NULL,                       -- unique, sans tenir compte des majuscules
  email          VARCHAR(255)  NULL,                           -- optionnel : récupération du mot de passe
  password_hash  VARCHAR(255)  NOT NULL,                       -- hash bcrypt / argon2, JAMAIS le mot de passe en clair
  avatar_url     VARCHAR(255)  NOT NULL DEFAULT 'avatars/default.png',  -- chemin ou URL de l'image de profil

  -- Statistiques de jeu
  games_played   INT UNSIGNED  NOT NULL DEFAULT 0,
  wins           INT UNSIGNED  NOT NULL DEFAULT 0,
  losses         INT UNSIGNED  NOT NULL DEFAULT 0,
  elo            INT UNSIGNED  NOT NULL DEFAULT 100,           -- classement des joueurs

  -- Gestion du compte
  is_active      BOOLEAN       NOT NULL DEFAULT TRUE,          -- FALSE = compte désactivé / banni
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at  TIMESTAMP     NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_players_pseudo (pseudo),
  UNIQUE KEY uq_players_email  (email),
  KEY idx_players_elo (elo),                                   -- accélère le classement

  CONSTRAINT chk_players_pseudo_length CHECK (CHAR_LENGTH(pseudo) >= 3)
) ENGINE = InnoDB;


-- -----------------------------------------------------------------------------
--  2. SESSIONS DE CONNEXION
--     On stocke l'empreinte SHA-256 du jeton, pas le jeton lui-même :
--     si la base fuite, les jetons restent inutilisables.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  player_id   INT UNSIGNED  NOT NULL,
  token_hash  CHAR(64)      NOT NULL,                          -- SHA-256 en hexadécimal
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY idx_sessions_expires (expires_at),                       -- pour purger les sessions expirées

  CONSTRAINT fk_sessions_player
    FOREIGN KEY (player_id) REFERENCES players (id)
    ON DELETE CASCADE
) ENGINE = InnoDB;


-- -----------------------------------------------------------------------------
--  3. DECKS ENREGISTRÉS
--     Un joueur peut sauvegarder plusieurs sélections de cartes.
--     card_id correspond à l'identifiant de la carte dans le code du jeu
--     (ex. 'pikachu-001'), il n'y a donc pas de table des cartes en base.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decks (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  player_id   INT UNSIGNED  NOT NULL,
  name        VARCHAR(50)   NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_decks_player_name (player_id, name),

  CONSTRAINT fk_decks_player
    FOREIGN KEY (player_id) REFERENCES players (id)
    ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS deck_cards (
  deck_id        INT UNSIGNED  NOT NULL,
  card_id        VARCHAR(50)   NOT NULL,
  is_invocation  BOOLEAN       NOT NULL DEFAULT FALSE,         -- carte choisie comme Invocation

  PRIMARY KEY (deck_id, card_id, is_invocation),

  CONSTRAINT fk_deck_cards_deck
    FOREIGN KEY (deck_id) REFERENCES decks (id)
    ON DELETE CASCADE
) ENGINE = InnoDB;


-- -----------------------------------------------------------------------------
--  4. HISTORIQUE DES PARTIES
--     Si un compte est supprimé, la partie reste dans l'historique.
--     winner_id NULL = partie en cours ou abandonnée.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  player1_id     INT UNSIGNED  NULL,
  player2_id     INT UNSIGNED  NULL,
  winner_id      INT UNSIGNED  NULL,
  rounds_played  INT UNSIGNED  NOT NULL DEFAULT 0,
  started_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at       TIMESTAMP     NULL,
  -- Journal de combat (ajoutées aussi automatiquement par le serveur si elles manquent)
  player1_score       INT UNSIGNED NULL,   -- dégâts infligés au joueur adverse
  player2_score       INT UNSIGNED NULL,
  player1_elo_before  INT          NULL,
  player1_elo_after   INT          NULL,
  player2_elo_before  INT          NULL,
  player2_elo_after   INT          NULL,
  player1_cards       TEXT         NULL,   -- identifiants des Pokémon du deck (JSON)
  player2_cards       TEXT         NULL,
  ranked              TINYINT(1)   NOT NULL DEFAULT 1,  -- 1 : classée, 0 : amicale


  PRIMARY KEY (id),
  KEY idx_matches_player1 (player1_id),
  KEY idx_matches_player2 (player2_id),

  CONSTRAINT fk_matches_player1
    FOREIGN KEY (player1_id) REFERENCES players (id) ON DELETE SET NULL,
  CONSTRAINT fk_matches_player2
    FOREIGN KEY (player2_id) REFERENCES players (id) ON DELETE SET NULL,
  CONSTRAINT fk_matches_winner
    FOREIGN KEY (winner_id)  REFERENCES players (id) ON DELETE SET NULL
) ENGINE = InnoDB;


-- -----------------------------------------------------------------------------
--  Exemple d'insertion :
--
--  INSERT INTO players (pseudo, email, password_hash, avatar_url)
--  VALUES ('Sacha', 'sacha@example.com', '<hash bcrypt généré par le serveur>', 'avatars/pikachu.png');
-- -----------------------------------------------------------------------------