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


function canAfford(userMoney, price) {
    return userMoney >= price;
}

module.exports = {
    getStartingCapital,
    getMatchReward,
    canAfford
};