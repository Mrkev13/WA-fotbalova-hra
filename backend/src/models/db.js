const { Pool } = require('pg');

const pool = new Pool({
    // Adresa se nyní bere bezpečně z proměnných prostředí:
    connectionString: process.env.DATABASE_URL,
    // SSL je pro Render povinné
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;