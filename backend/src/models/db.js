const { Pool } = require('pg');

const pool = new Pool({
    // Zkusí použít vnitřní Render proměnnou, a když ji nenajde (třeba u tebe doma), použije tu dlouhou vnější adresu
    connectionString: process.env.DATABASE_URL || 'postgresql://pixel_football_db_user:YfqSXd5XcrmGLyTpXZzxdFrAwx4Cbo2v@dpg-d6omc1cr85hc739i6150-a.frankfurt-postgres.render.com/pixel_football_db',
    // SSL je pro Render povinné
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;