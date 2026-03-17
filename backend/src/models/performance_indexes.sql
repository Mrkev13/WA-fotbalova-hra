-- PERFORMANCE INDEXES (LOCAL ONLY - DO NOT DEPLOY YET)
-- Tyto indexy výrazně zrychlují vyhledávání na trhu, ale v produkci by mohly zpomalit zápisy.
-- Marián: Používám to u sebe pro plynulejší vývoj.

CREATE INDEX idx_market_filter ON players(owner_id, status, market_value);
CREATE INDEX idx_user_login ON users(username, password_hash);
