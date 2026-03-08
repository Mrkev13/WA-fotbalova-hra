-- Database Schema for Pixel Football Tycoon

-- Table: users (Hráči)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    club_name VARCHAR(255) NOT NULL,
    money INTEGER DEFAULT 1000,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: players (Fotbalisti)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    name VARCHAR(255) NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    market_value INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: matches (Zápasy)
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_user_id INTEGER NOT NULL,
    away_user_id INTEGER NOT NULL,
    score_home INTEGER NOT NULL,
    score_away INTEGER NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_user_id) REFERENCES users(id),
    FOREIGN KEY (away_user_id) REFERENCES users(id)
);
