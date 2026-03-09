
const db = require('../models/db');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const POSITIONS = ['Útočník', 'Záložník', 'Obránce', 'Brankář'];

async function generateRandomPlayer(userId) {
    // 1. Get random names from DB
    const firstNameRes = await db.query('SELECT name FROM first_names ORDER BY RANDOM() LIMIT 1');
    const lastNameRes = await db.query('SELECT name FROM last_names ORDER BY RANDOM() LIMIT 1');
    
    const firstName = firstNameRes.rows[0]?.name || 'Jan';
    const lastName = lastNameRes.rows[0]?.name || 'Novák';
    const fullName = `${firstName} ${lastName}`;

    // 2. Generate stats (10-100)
    const att = getRandomInt(10, 50); // Startovní hráči jsou slabší
    const def = getRandomInt(10, 50);
    const position = POSITIONS[getRandomInt(0, POSITIONS.length - 1)];

    // 3. Calculate market value
    const marketValue = (att + def) * 10;

    // 4. Insert into DB
    await db.query(
        `INSERT INTO players (user_id, name, position, attack, defense, market_value, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'IN_TEAM')`,
        [userId, fullName, position, att, def, marketValue]
    );
}

async function generateStartingEleven(userId) {
    for (let i = 0; i < 11; i++) {
        await generateRandomPlayer(userId);
    }
}

module.exports = {
    generateStartingEleven
};