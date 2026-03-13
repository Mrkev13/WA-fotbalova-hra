const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();

const db = require('../models/db'); // Tvé připojení k DB
const playerService = require('../services/playerService');
const matchService = require('../services/matchService');
const economyService = require('../services/economyService');

async function ensureBotUserId() {
    const existing = await db.query(
        "SELECT id FROM users WHERE username = $1 OR club_name = $2 LIMIT 1",
        ['BOT', 'BOT']
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    try {
        const inserted = await db.query(
            `INSERT INTO users (username, password_hash, club_name, money, xp, level, elo_rating)
             VALUES ($1, $2, $3, 0, 0, 1, 1000)
             RETURNING id`,
            ['BOT', passwordHash, 'BOT']
        );
        return inserted.rows[0].id;
    } catch (_) {
        const fallback = await db.query(
            "SELECT id FROM users WHERE username = $1 OR club_name = $2 LIMIT 1",
            ['BOT', 'BOT']
        );
        if (fallback.rows.length > 0) return fallback.rows[0].id;
        throw _;
    }
}

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

const authenticateSession = authenticateToken;

// ==========================================
// 1. REGISTRACE (/api/register)
// ==========================================
router.post('/register', async (req, res) => {
    const { username, password, club_name } = req.body;

    if (!username || username.trim().length < 3) { 
        return res.status(400).json({ error: "Uživatelské jméno musí mít alespoň 3 znaky." }); 
    } 
    if (!club_name || club_name.trim().length < 3) { 
        return res.status(400).json({ error: "Název klubu musí mít alespoň 3 znaky." }); 
    } 
    if (!password || password.length < 6) { 
        return res.status(400).json({ error: "Heslo musí mít alespoň 6 znaků." }); 
    } 

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

        res.json({ 
            token, 
            message: "Úspěšné přihlášení", 
            user: { 
                id: user.id, 
                username: user.username, 
                money: user.money, 
                level: user.level, 
                elo_rating: user.elo_rating, 
                xp: user.xp 
            } 
        }); 
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
        await playerService.ensureMarketPlayers(20);
        const result = await db.query("SELECT * FROM players WHERE status = 'ON_MARKET' AND user_id IS NULL ORDER BY market_value DESC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, username, club_name, money, level, elo_rating
             FROM users
             WHERE username != 'BOT'
             ORDER BY elo_rating DESC, level DESC, xp DESC, created_at ASC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/train', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { playerId, statType } = req.body;

    const allowed = { attack: 'attack', defense: 'defense' };
    const column = allowed[statType];
    if (!column) return res.status(400).json({ error: "Neplatný typ vylepšení. Použij 'attack' nebo 'defense'." });
    if (!playerId) return res.status(400).json({ error: "Chybí playerId." });

    const trainingCost = 50;
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const moneyRes = await client.query('SELECT money FROM users WHERE id = $1 FOR UPDATE', [userId]);
        if (moneyRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Uživatel nenalezen." });
        }
        if ((moneyRes.rows[0].money || 0) < trainingCost) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Nemáš dostatek peněz (min. 50 mincí)." });
        }

        const playerRes = await client.query(
            `SELECT ${column} FROM players WHERE id = $1 AND user_id = $2 FOR UPDATE`,
            [playerId, userId]
        );
        if (playerRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Hráč nenalezen." });
        }
        if ((playerRes.rows[0][column] || 0) >= 100) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Stat je už na maximu (100)." });
        }

        await client.query('UPDATE users SET money = money - $1 WHERE id = $2', [trainingCost, userId]);
        const updated = await client.query(
            `UPDATE players SET ${column} = ${column} + 1 WHERE id = $1 AND user_id = $2 RETURNING ${column} AS value`,
            [playerId, userId]
        );

        await client.query('COMMIT');
        res.json({ message: "Trénink proběhl úspěšně.", stat: statType, newValue: updated.rows[0]?.value });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

router.post('/fire_player', authenticateSession, async (req, res) => {
    try {
        const { playerId } = req.body;

        // Zjistíme hodnotu hráče
        const playerRes = await db.query(
            "SELECT market_value FROM players WHERE id = $1 AND user_id = $2",
            [playerId, req.user.id]
        );

        if (playerRes.rowCount === 0) {
            return res.status(404).json({ error: "Hráč nenalezen nebo nepatří tvému týmu." });
        }

        const refund = Math.floor((playerRes.rows[0].market_value || 0) / 2);

        // Smažeme hráče
        await db.query("DELETE FROM players WHERE id = $1", [playerId]);
        
        // Vrátíme peníze uživateli
        const userRes = await db.query(
            "UPDATE users SET money = money + $1 WHERE id = $2 RETURNING money",
            [refund, req.user.id]
        );

        res.json({
            message: `Hráč propuštěn. Získal jsi zpět ${refund} mincí (50 % hodnoty).`,
            newMoney: userRes.rows[0].money
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 5. NÁKUP HRÁČE (/api/buy_player)
router.post('/buy_player', authenticateToken, async (req, res) => {
    const { playerId } = req.body;
    const userId = req.user.id;

    try {
        const countRes = await db.query(
            "SELECT COUNT(*)::int AS count FROM players WHERE user_id = $1 AND status = 'IN_TEAM'",
            [userId]
        );
        const inTeamCount = countRes.rows[0]?.count || 0;
        if (inTeamCount >= 11) {
            return res.status(400).json({ error: "Máš plný tým (11 hráčů)! Musíš někoho propustit nebo prodat na trh, abys mohl koupit nového." });
        }

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
        const myTeamRes = await db.query("SELECT attack, defense FROM players WHERE user_id = $1 AND status = 'IN_TEAM'", [userId]);
        const myTeam = myTeamRes.rows;
        
        if (myTeam.length !== 11) {
            return res.status(400).json({ error: "Pro zahájení zápasu musíš mít v aktivním týmu přesně 11 hráčů!" });
        }

        const myAttackTotal = myTeam.reduce((sum, p) => sum + (p.attack || 0), 0);
        const myDefenseTotal = myTeam.reduce((sum, p) => sum + (p.defense || 0), 0);

        let opponentTeam = [];
        let opponentIsBot = away_user_id == null;
        let opponentId = opponentIsBot ? await ensureBotUserId() : away_user_id;

        if (!opponentIsBot) {
            // Načtení soupeřova týmu z DB
            const oppTeamRes = await db.query("SELECT attack, defense FROM players WHERE user_id = $1 AND status = 'IN_TEAM'", [opponentId]);
            opponentTeam = oppTeamRes.rows;
            
            if (opponentTeam.length === 0) {
                opponentIsBot = true;
            } else if (opponentTeam.length !== 11) {
                return res.status(400).json({ error: "Soupeř nemá kompletní tým!" });
            }
        }

        if (opponentIsBot) {
            const factor = 0.8 + (Math.random() * 0.4);
            const botAttackTotal = Math.max(110, Math.round(myAttackTotal * factor));
            const botDefenseTotal = Math.max(110, Math.round(myDefenseTotal * factor));

            const baseAttack = Math.max(10, Math.min(100, Math.floor(botAttackTotal / 11)));
            const baseDefense = Math.max(10, Math.min(100, Math.floor(botDefenseTotal / 11)));

            opponentTeam = Array.from({ length: 11 }, () => ({ attack: baseAttack, defense: baseDefense }));
        }

        // Simulace
        const matchResult = matchService.simulateMatch(myTeam, opponentTeam);
        const isWin = matchResult.myGoals > matchResult.opponentGoals;
        const isDraw = matchResult.myGoals === matchResult.opponentGoals;

        // Odměny - načítání přes economyService (z configu)
        let resultType = isWin ? 'win' : (isDraw ? 'draw' : 'lose');
        
        const moneyReward = economyService.getMatchMoneyReward(resultType);
        const xpReward = economyService.getMatchXPReward(resultType);
        const eloChange = economyService.getMatchEloReward(resultType);

        const matchRes = await db.query(
            `INSERT INTO matches (home_user_id, away_user_id, score_home, score_away) 
             VALUES ($1, $2, $3, $4) RETURNING id`, 
            [userId, opponentId, matchResult.myGoals, matchResult.opponentGoals] 
        ); 
        const matchId = matchRes.rows[0].id; 
 
        let events = []; 
        const getRandMinute = () => Math.floor(Math.random() * 89) + 1; 
         
        for (let i = 0; i < matchResult.myGoals; i++) { 
            events.push({ match_id: matchId, minute: getRandMinute(), event_type: 'GOAL', description: 'Gól domácích!' }); 
        } 
        for (let i = 0; i < matchResult.opponentGoals; i++) { 
            events.push({ match_id: matchId, minute: getRandMinute(), event_type: 'GOAL', description: 'Gól soupeře!' }); 
        } 
         
        events.sort((a, b) => a.minute - b.minute); 
 
        for (const ev of events) { 
            await db.query( 
                `INSERT INTO match_events (match_id, minute, event_type, description) VALUES ($1, $2, $3, $4)`, 
                [ev.match_id, ev.minute, ev.event_type, ev.description] 
            ); 
        } 

        // Update uživatele a Level Up odměna 
        const userRes = await db.query('SELECT xp, level FROM users WHERE id = $1', [userId]); 
        const currentXp = userRes.rows[0]?.xp || 0; 
        const currentLevel = userRes.rows[0]?.level || 1; 
 
        const newXp = currentXp + xpReward; 
        const newLevel = Math.floor(newXp / 100) + 1; 
 
        let finalMoneyReward = moneyReward; 
        if (newLevel > currentLevel) { 
            finalMoneyReward += (newLevel - currentLevel) * 100; // +100 mincí za každý level navíc 
        } 
 
        await db.query( 
            `UPDATE users 
             SET money = money + $1, xp = $2, level = $3, elo_rating = elo_rating + $4 
             WHERE id = $5`, 
            [finalMoneyReward, newXp, newLevel, eloChange, userId] 
        ); 
        
        // Pokud je soupeř reálný hráč, upravíme mu ELO (zjednodušeně)
        if (!opponentIsBot) {
             await db.query(
                `UPDATE users SET elo_rating = elo_rating - $1 WHERE id = $2`, 
                [eloChange, opponentId]
            );
        }

        res.json({
            score: matchResult.resultString,
            reward: `+${finalMoneyReward} mincí`,
            xp: `+${xpReward} XP`,
            elo_diff: `${eloChange > 0 ? '+' : ''}${eloChange}`,
            message: isWin ? "Vyhrál jsi!" : (isDraw ? "Remíza!" : "Prohrál jsi!"),
            events: events
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
