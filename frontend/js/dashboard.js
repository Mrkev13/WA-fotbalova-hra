// ═══════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const players = await apiFetch('GET', '/team');
    teamData = players;
    $('sd-players').textContent = players.length;
  } catch (_) { /* non-critical */ }
}

function showLastMatchBanner(result) {
  if (!result) return;
  $('dash-last-score').textContent  = result.score || '?';
  const isWin  = (result.message || '').includes('Vyhr');
  const isDraw = (result.message || '').includes('Rem');
  $('dash-last-result').textContent = isWin ? 'VÝHRA' : isDraw ? 'REMÍZA' : 'PROHRA';
  $('dash-last').style.display = 'flex';
}
