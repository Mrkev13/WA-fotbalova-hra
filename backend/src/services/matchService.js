
function simulateAction(attackTotal, defenseTotal) {
    if (attackTotal === 0 && defenseTotal === 0) return Math.random() > 0.5;
    const scoreChance = attackTotal / (attackTotal + defenseTotal);
    const finalChance = Math.max(0.1, Math.min(0.9, scoreChance));
    return Math.random() < finalChance;
}


function simulateMatch(myTeam, opponentTeam) {
    let myGoals = 0;
    let opponentGoals = 0;

    const myAtt = myTeam.reduce((sum, player) => sum + player.attack, 0);
    const myDef = myTeam.reduce((sum, player) => sum + player.defense, 0);
    
    const oppAtt = opponentTeam.reduce((sum, player) => sum + player.attack, 0);
    const oppDef = opponentTeam.reduce((sum, player) => sum + player.defense, 0);

    for(let i = 0; i < 5; i++) {
        if (simulateAction(myAtt, oppDef)) myGoals++;
    }

    for(let i = 0; i < 5; i++) {
        if (simulateAction(oppAtt, myDef)) opponentGoals++;
    }

    return { 
        myGoals, 
        opponentGoals,
        resultString: `${myGoals} : ${opponentGoals}`
    };
}

module.exports = {
    simulateMatch
};
