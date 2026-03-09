const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();

const db = require('../models/db'); // Tvé připojení k DB
const playerService = require('../services/playerService');
const matchService = require('../services/matchService');
const economyService = require('../services/economyService');

// --- MIDDLEWARE PRO OVĚŘENÍ TOKENU ---
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Chybí token!" });
    
    try {
        const result = await db.query(
            `SELECT u.id, u.username, u.money, u.level, u.elo_rating 
             FROM sessions s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.token = $1 AND s.expires_at > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ error: "Neplatný nebo expirovaný token!" });
        }

        req.user = result.rows[0];
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Chyba při ověřování tokenu." });
    }
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

        // Vygenerování 11 startovních hráčů (nyní přes playerService s DB)
        await playerService.generateStartingEleven(userId);
        
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

        // Generování random session tokenu
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Token platí 24 hodin

        await db.query(
            `INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
            [user.id, token, expiresAt]
        );

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
        // Zobrazí hráče, kteří jsou na trhu nebo nemají majitele
        const result = await db.query("SELECT * FROM players WHERE status = 'ON_MARKET' OR user_id IS NULL");
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
        // Použití bezpečné DB funkce
        await db.query('SELECT buy_player_secure($1, $2)', [userId, playerId]);

        res.json({ message: "Hráč úspěšně zakoupen!" });
    } catch (error) {
        // Odchycení chyby z DB (např. nedostatek peněz)
        res.status(400).json({ error: error.message });
    }
});


// 6. ZÁPAS (/api/match/play)
router.post('/match/play', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { away_user_id } = req.body;
    
    try {
        // Načtení domácího týmu
        const myTeamRes = await db.query("SELECT attack as att, defense as def FROM players WHERE user_id = $1 AND status = 'IN_TEAM'", [userId]);
        const myTeam = myTeamRes.rows;
        
        if (myTeam.length < 11) return res.status(400).json({ error: "Musíš mít alespoň 11 hráčů v týmu!" });

        let opponentTeam = [];
        let opponentId = away_user_id || 0; // Pokud není zadán soupeř, ID 0 (bot)

        if (opponentId !== 0) {
            // Načtení soupeřova týmu z DB
            const oppTeamRes = await db.query("SELECT attack as att, defense as def FROM players WHERE user_id = $1 AND status = 'IN_TEAM'", [opponentId]);
            opponentTeam = oppTeamRes.rows;
            
            if (opponentTeam.length < 11) {
                // Fallback nebo error - zde zvolíme error, pokud chceme validní zápas
                return res.status(400).json({ error: "Soupeř nemá kompletní tým!" });
            }
        } else {
            // Generování náhodného týmu (pro testování nebo PvE) - použijeme starou logiku, ale musíme ji mít dostupnou
            // Protože playerService.generateStartingEleven nově ukládá do DB, musíme si zde vygenerovat jen "staty" v paměti
            // Pro jednoduchost zde vytvoříme dummy tým
             for(let i=0; i<11; i++) {
                opponentTeam.push({ att: Math.floor(Math.random() * 40) + 10, def: Math.floor(Math.random() * 40) + 10 });
            }
        }

        // Simulace
        const matchResult = matchService.simulateMatch(myTeam, opponentTeam);
        const isWin = matchResult.myGoals > matchResult.opponentGoals;
        const isDraw = matchResult.myGoals === matchResult.opponentGoals;

        // Odměny
        let moneyReward = 0;
        let xpReward = 0;
        let eloChange = 0;

        if (isWin) {
            moneyReward = economyService.getMatchReward(true); 
            xpReward = 10; 
            eloChange = 10;
        } else if (isDraw) {
            moneyReward = economyService.getMatchReward(false); 
            xpReward = 5;
            eloChange = 0;
        } else {
            moneyReward = economyService.getMatchReward(false); 
            xpReward = 2;
            eloChange = -5;
        }

        // Zápis zápasu
        await db.query(
            `INSERT INTO matches (home_user_id, away_user_id, score_home, score_away) 
             VALUES ($1, $2, $3, $4)`,
            [userId, opponentId, matchResult.myGoals, matchResult.opponentGoals]
        );

        // Update uživatele (peníze, XP, ELO)
        await db.query(
            `UPDATE users SET money = money + $1, xp = xp + $2, elo_rating = elo_rating + $3 WHERE id = $4`, 
            [moneyReward, xpReward, eloChange, userId]
        );
        
        // Pokud je soupeř reálný hráč, upravíme mu ELO (zjednodušeně)
        if (opponentId !== 0) {
             await db.query(
                `UPDATE users SET elo_rating = elo_rating - $1 WHERE id = $2`, 
                [eloChange, opponentId]
            );
        }

        res.json({
            score: matchResult.resultString,
            reward: `+${moneyReward} mincí`,
            xp: `+${xpReward} XP`,
            elo_diff: `${eloChange > 0 ? '+' : ''}${eloChange}`,
            message: isWin ? "Vyhrál jsi!" : (isDraw ? "Remíza!" : "Prohrál jsi!")
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
