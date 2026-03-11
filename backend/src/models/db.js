const { Pool } = require('pg');

const pool = new Pool({
    // V cloudu použije Render URL, u vás doma použije ty staré údaje
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:MaxipesFin@localhost:5432/pixel_football',
    // Pro Render je nutné povolit SSL připojení k databázi
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

module.exports = pool;