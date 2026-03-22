
const db = require('../models/db');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const POSITIONS = ['Útočník', 'Záložník', 'Obránce', 'Brankář'];

async function getRandomName() {
    const firstNameRes = await db.query('SELECT name FROM first_names ORDER BY RANDOM() LIMIT 1');
    const lastNameRes = await db.query('SELECT name FROM last_names ORDER BY RANDOM() LIMIT 1');

    const firstName = firstNameRes.rows[0]?.name || 'Jan';
    const lastName = lastNameRes.rows[0]?.name || 'Novák';
    return `${firstName} ${lastName}`;
}

async function generateRandomPlayer(userId, positionOverride) {
    const fullName = await getRandomName();

    const position = positionOverride || POSITIONS[getRandomInt(0, POSITIONS.length - 1)];

    let att = 0, def = 0;
    if (position === 'Brankář') {
        att = getRandomInt(10, 15);
        def = getRandomInt(75, 95);
    } else if (position === 'Obránce') {
        att = getRandomInt(15, 35);
        def = getRandomInt(65, 95);
    } else if (position === 'Útočník') {
        att = getRandomInt(70, 95);
        def = getRandomInt(15, 35);
    } else {
        const baseStat = getRandomInt(50, 75);
        att = baseStat + getRandomInt(-10, 10);
        def = baseStat + getRandomInt(-10, 10);
    }

    const marketValue = (att + def) * 10;

    await db.query(
        `INSERT INTO players (user_id, name, position, attack, defense, market_value, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'IN_TEAM')`,
        [userId, fullName, position, att, def, marketValue]
    );
}

async function generateMarketPlayer() {
    const fullName = await getRandomName();
    const position = POSITIONS[getRandomInt(0, POSITIONS.length - 1)];

    let att = 0, def = 0;
    if (position === 'Brankář') {
        att = getRandomInt(10, 15);
        def = getRandomInt(75, 95);
    } else if (position === 'Obránce') {
        att = getRandomInt(15, 35);
        def = getRandomInt(65, 95);
    } else if (position === 'Útočník') {
        att = getRandomInt(70, 95);
        def = getRandomInt(15, 35);
    } else {
        const baseStat = getRandomInt(50, 75);
        att = baseStat + getRandomInt(-10, 10);
        def = baseStat + getRandomInt(-10, 10);
    }

    const marketValue = (att + def) * 10;

    await db.query(
        `INSERT INTO players (user_id, name, position, attack, defense, market_value, status)
         VALUES (NULL, $1, $2, $3, $4, $5, 'ON_MARKET')`,
        [fullName, position, att, def, marketValue]
    );
}

async function ensureMarketPlayers(minCount) {
    const countRes = await db.query(
        "SELECT COUNT(*)::int AS count FROM players WHERE status = 'ON_MARKET' AND user_id IS NULL"
    );
    const current = countRes.rows[0]?.count || 0;
    const toCreate = Math.max(0, (minCount || 0) - current);
    for (let i = 0; i < toCreate; i++) {
        await generateMarketPlayer();
    }
}

async function generateStartingEleven(userId) {
    const formation = [
        'Brankář',
        'Obránce', 'Obránce', 'Obránce', 'Obránce',
        'Záložník', 'Záložník', 'Záložník', 'Záložník',
        'Útočník', 'Útočník'
    ];

    for (let i = 0; i < 11; i++) {
        await generateRandomPlayer(userId, formation[i]);
    }
}

module.exports = {
    generateStartingEleven,
    ensureMarketPlayers
};
