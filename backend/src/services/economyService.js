const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'economy_config.json');
const economyConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));


function getStartingCapital() {
    return economyConfig.registrace_startovni_kapital;
}


function getMatchReward(isWin) {
    return isWin ? economyConfig.vyhra_v_zapase : economyConfig.prohra_v_zapase;
}

function getMatchMoneyReward(result) {
    if (result === 'win') return economyConfig.vyhra_v_zapase;
    if (result === 'draw') return economyConfig.remiza_v_zapase;
    return economyConfig.prohra_v_zapase;
}

function getMatchXPReward(result) {
    if (result === 'win') return economyConfig.xp_odmeny.vyhra;
    if (result === 'draw') return economyConfig.xp_odmeny.remiza;
    return economyConfig.xp_odmeny.prohra;
}

function getMatchEloReward(result) {
    if (result === 'win') return economyConfig.elo_odmeny.vyhra;
    if (result === 'draw') return economyConfig.elo_odmeny.remiza;
    return economyConfig.elo_odmeny.prohra;
}

function canAfford(userMoney, price) {
    return userMoney >= price;
}

module.exports = {
    getStartingCapital,
    getMatchReward, // Ponecháno pro případné jiné použití, ale v routes použiju nové
    getMatchMoneyReward,
    getMatchXPReward,
    getMatchEloReward,
    canAfford
};
