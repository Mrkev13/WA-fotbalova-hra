const { Pool } = require('pg');

const pool = new Pool({
    // Žádné process.env! Natvrdo jen ta externí adresa:
    connectionString: 'postgresql://pixel_football_db_user:YfqSXd5XcrmGLyTpXZzxdFrAwx4Cbo2v@dpg-d6omc1cr85hc739i6150-a.frankfurt-postgres.render.com/pixel_football_db',
    // SSL je pro Render povinné
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;