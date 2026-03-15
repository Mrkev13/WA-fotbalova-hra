-- Database Schema for Pixel Football Tycoon

-- Table: users (Hráči)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    club_name VARCHAR(255) NOT NULL UNIQUE,
    money INTEGER DEFAULT 1000 CHECK (money >= 0),
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    elo_rating INTEGER DEFAULT 1000, -- For leaderboard (Elo system)
    last_daily_bonus TIMESTAMP, -- For 24h bonus tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: sessions (Pro API přihlašování)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: players (Fotbalisti)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(20) DEFAULT 'Universal' CHECK (position IN ('Útočník', 'Záložník', 'Obránce', 'Brankář', 'Universal')),
    attack INTEGER NOT NULL CHECK (attack BETWEEN 10 AND 100), -- Max 100 limit for training
    defense INTEGER NOT NULL CHECK (defense BETWEEN 10 AND 100), -- Max 100 limit for training
    stamina INTEGER DEFAULT 100 CHECK (stamina BETWEEN 0 AND 100), -- Fatigue system
    market_value INTEGER NOT NULL CHECK (market_value >= 0),
    status VARCHAR(20) DEFAULT 'IN_TEAM' CHECK (status IN ('ON_MARKET', 'IN_TEAM', 'RETIRED')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: training_queue (Čekárna na trénink)
CREATE TABLE IF NOT EXISTS training_queue (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    stat_to_improve VARCHAR(20) NOT NULL CHECK (stat_to_improve IN ('attack', 'defense', 'stamina')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Table: first_names (Slovník křestních jmen pro generátor)
CREATE TABLE IF NOT EXISTS first_names (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Table: last_names (Slovník příjmení pro generátor)
CREATE TABLE IF NOT EXISTS last_names (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Table: transactions (Logování ekonomiky)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- e.g., 'MATCH_REWARD', 'PLAYER_BOUGHT', 'TRAINING'
    description TEXT,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: matches (Zápasy)
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_user_id INTEGER NOT NULL,
    away_user_id INTEGER NOT NULL,
    score_home INTEGER NOT NULL CHECK (score_home >= 0),
    score_away INTEGER NOT NULL CHECK (score_away >= 0),
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (away_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (home_user_id != away_user_id)
);

-- Table: match_events (Log zápasu)
CREATE TABLE IF NOT EXISTS match_events (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL,
    minute INTEGER NOT NULL CHECK (minute BETWEEN 1 AND 90),
    event_type VARCHAR(50) NOT NULL, -- e.g., 'GOAL', 'SHOT', 'SAVE'
    description TEXT NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- Data pro generátor (MVP Seed data)
INSERT INTO first_names (name) VALUES ('Karel'), ('Jan'), ('Petr'), ('Josef'), ('Jiří'), ('Pavel'), ('Martin'), ('Tomáš'), ('Jaroslav'), ('Miroslav') ON CONFLICT DO NOTHING;
INSERT INTO last_names (name) VALUES ('Novák'), ('Svoboda'), ('Novotný'), ('Dvořák'), ('Černý'), ('Procházka'), ('Kučera'), ('Veselý'), ('Krejčí'), ('Horák') ON CONFLICT DO NOTHING;

-- System Bot for PvE matches (ID 0)
INSERT INTO users (id, username, password_hash, club_name, money) 
VALUES (0, 'Bot', 'bot_system_hash', 'Bot Club', 999999) 
ON CONFLICT (id) DO NOTHING;

-- Indexes pro optimalizaci DB dotazů (Performance Optimization)
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_training_queue_player_id ON training_queue(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_user_id ON matches(home_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_user_id ON matches(away_user_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);

-- Triggers (PostgreSQL specific functions for constraints could be added here later)


-- =========================================================
-- PL/pgSQL FUNKCE PRO ZABEZPEČENÍ TRANSAKCÍ (ODOLNOST API)
-- =========================================================

CREATE OR REPLACE FUNCTION buy_player_secure(
    p_buyer_id INTEGER,
    p_player_id INTEGER
) RETURNS BOOLEAN AS $body
DECLARE
    v_player_price INTEGER;
    v_buyer_money INTEGER;
    v_player_status VARCHAR;
    v_owner_id INTEGER;
BEGIN
    SELECT market_value, status, user_id INTO v_player_price, v_player_status, v_owner_id
    FROM players 
    WHERE id = p_player_id 
    FOR UPDATE;

    -- Check if player exists and is available
    IF v_player_price IS NULL OR (v_player_status != 'ON_MARKET' AND v_owner_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Hráč není na trhu nebo neexistuje.';
    END IF;

    -- Get buyer money
    SELECT money INTO v_buyer_money
    FROM users 
    WHERE id = p_buyer_id 
    FOR UPDATE;

    IF v_buyer_money < v_player_price THEN
        RAISE EXCEPTION 'Nedostatek peněz na nákup.';
    END IF;

    -- Update balances and ownership
    UPDATE users SET money = money - v_player_price WHERE id = p_buyer_id;
    UPDATE players SET user_id = p_buyer_id, status = 'IN_TEAM' WHERE id = p_player_id;
    
    -- Log transaction
    INSERT INTO transactions (user_id, amount, transaction_type, description)
    VALUES (p_buyer_id, -v_player_price, 'PLAYER_BOUGHT', 'Nákup hráče ID ' || p_player_id);

    RETURN TRUE;
END;
$body LANGUAGE plpgsql;
