const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const db = require('../models/db'); // Tvé připojení k DB
const playerService = require('../services/playerService');
const matchService = require('../services/matchService');
const economyService = require('../services/economyService');

const JWT_SECRET = 'super_tajny_klic_pixel_football';

// --- MIDDLEWARE PRO OVĚŘENÍ TOKENU ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Chybí token!" });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Neplatný token!" });
        req.user = user;
        next();
    });
};

// ==========================================
// 1. REGISTRACE (/api/register)
// ==========================================
router.post('/register', async (req, res) => {
    const { username, password, club_name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const startingMoney = economyService.getStartingCapital(); 

        const userRes = await db.query(
            `INSERT INTO users (username, password_hash, club_name, money, level) 
             VALUES ($1, $2, $3, $4, 1) RETURNING id`,
            [username, hashedPassword, club_name, startingMoney]
        );
        const userId = userRes.rows[0].id;

        // Vygenerování 11 startovních hráčů
        const startingEleven = playerService.generateStartingEleven();
        
        for (const player of startingEleven) {
            await db.query(
                `INSERT INTO players (user_id, name, attack, defense, market_value) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, `${player.firstName} ${player.lastName}`, player.att, player.def, player.price]
            );
        }

        res.status(201).json({ message: "Uživatel a startovní tým úspěšně vytvořeni!" });
    } catch (error) {
        res.status(500).json({ error: "Chyba při registraci: " + error.message });
    }
});


// 2. LOGIN 

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(400).json({ error: "Uživatel nenalezen" });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) return res.status(400).json({ error: "Špatné heslo" });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, message: "Úspěšné přihlášení", user: { username: user.username, money: user.money, level: user.level } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 3. MŮJ TÝM (/api/team)
router.get('/team', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM players WHERE user_id = $1', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 4. TRH HRÁČŮ (/api/market)
router.get('/market', authenticateToken, async (req, res) => {
    try {
        // Zobrazí hráče, kteří nemají majitele
        const result = await db.query('SELECT * FROM players WHERE user_id IS NULL');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. NÁKUP HRÁČE (/api/buy_player)

router.post('/buy_player', authenticateToken, async (req, res) => {
    const { playerId } = req.body;
    const userId = req.user.id;

    try {
        const userRes = await db.query('SELECT money FROM users WHERE id = $1', [userId]);
        const playerRes = await db.query('SELECT * FROM players WHERE id = $1 AND user_id IS NULL', [playerId]);
        
        if (playerRes.rows.length === 0) return res.status(400).json({ error: "Hráč neexistuje nebo už je prodaný." });
        
        const userMoney = userRes.rows[0].money;
        const playerPrice = playerRes.rows[0].market_value;

        if (!economyService.canAfford(userMoney, playerPrice)) {
            return res.status(400).json({ error: "Nemáš dostatek peněz." });
        }

        await db.query('UPDATE users SET money = money - $1 WHERE id = $2', [playerPrice, userId]);
        await db.query('UPDATE players SET user_id = $1 WHERE id = $2', [userId, playerId]);

        res.json({ message: "Hráč úspěšně zakoupen!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 6. ZÁPAS (/api/match/play)

router.post('/match/play', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    try {
        const myTeamRes = await db.query('SELECT attack as att, defense as def FROM players WHERE user_id = $1', [userId]);
        const myTeam = myTeamRes.rows;
        
        if (myTeam.length < 11) return res.status(400).json({ error: "Musíš mít alespoň 11 hráčů v týmu!" });

        const opponentTeam = playerService.generateStartingEleven();

        const matchResult = matchService.simulateMatch(myTeam, opponentTeam);
        const isWin = matchResult.myGoals > matchResult.opponentGoals;
        const isDraw = matchResult.myGoals === matchResult.opponentGoals;

        let moneyReward = 0;
        let xpReward = 0;

        if (isWin) {
            moneyReward = economyService.getMatchReward(true); 
            xpReward = 50; 
        } else if (isDraw) {
            moneyReward = economyService.getMatchReward(false); 
            xpReward = 20;
        } else {
            moneyReward = economyService.getMatchReward(false); 
            xpReward = 10;
        }

      
        await db.query(
            `INSERT INTO matches (home_user_id, away_user_id, score_home, score_away) 
             VALUES ($1, $2, $3, $4)`,
            [userId, 0, matchResult.myGoals, matchResult.opponentGoals]
        );

        await db.query(
            `UPDATE users SET money = money + $1 WHERE id = $2`, 
            [moneyReward, userId]
        );

        res.json({
            score: matchResult.resultString,
            reward: `+${moneyReward} mincí`,
            xp: `+${xpReward} XP`,
            message: isWin ? "Vyhrál jsi!" : (isDraw ? "Remíza!" : "Prohrál jsi!")
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
