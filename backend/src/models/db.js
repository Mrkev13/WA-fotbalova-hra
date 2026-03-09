const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',       //  jméno v DB
    host: 'localhost',
    database: 'pixel_football',
    password: '', //  heslo
    port: 5432,
});

module.exports = pool;