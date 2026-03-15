const pool = require('./src/models/db');

async function insertBot() {
    try {
        console.log('Inserting Bot (ID 0)...');
        // Explicitly set ID 0
        await pool.query(`
            INSERT INTO users (id, username, password_hash, club_name, money) 
            VALUES (0, 'Bot', 'bot_system_hash', 'Bot Club', 999999) 
            ON CONFLICT (id) DO NOTHING
        `);
        console.log('SUCCESS: Bot (ID 0) inserted or already exists.');
        
        // Let's also verify it's there
        const res = await pool.query('SELECT id, username FROM users WHERE id = 0');
        console.log('Verification:', res.rows[0]);
    } catch (err) {
        console.error('ERROR inserting Bot:', err.message);
    } finally {
        await pool.end();
    }
}

insertBot();
