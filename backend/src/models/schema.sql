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
    last_daily_bonus TIMESTAMP, -- For 24h bonus tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Triggers (PostgreSQL specific functions for constraints could be added here later, e.g. squad size limit)
