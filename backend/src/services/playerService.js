
const firstNames = ["Karel", "Jan", "Petr", "Tomáš", "Lukáš", "Martin", "Pavel"];
const lastNames = ["Novák", "Svoboda", "Novotný", "Dvořák", "Černý", "Procházka"];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePlayer() {
    const att = getRandomInt(10, 50);
    const def = getRandomInt(10, 50);
    const price = (att + def) * 10;
    
    return {
        firstName: firstNames[getRandomInt(0, firstNames.length - 1)],
        lastName: lastNames[getRandomInt(0, lastNames.length - 1)],
        att: att,
        def: def,
        price: price
    };
}


function generateStartingEleven() {
    const team = [];
    for (let i = 0; i < 11; i++) {
        team.push(generatePlayer());
    }
    return team;
}

module.exports = {
    generatePlayer,
    generateStartingEleven
};