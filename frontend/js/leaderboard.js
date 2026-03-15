// ═══════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════
async function loadLeaderboard() {
  $('lb-loader').classList.add('show');
  $('lb-tbl').style.display = 'none';
  try {
    const users = await apiFetch('GET', '/leaderboard');
    renderLeaderboard(users);
  } catch (e) {
    $('lb-tbody').innerHTML =
      '<tr><td colspan="5" style="padding:20px;color:var(--rd);text-align:center">' +
      escHtml(e.message) + '</td></tr>';
    $('lb-tbl').style.display = '';
  } finally {
    $('lb-loader').classList.remove('show');
  }
}

function renderLeaderboard(users) {
  if (!users || !users.length) {
    $('lb-tbody').innerHTML =
      '<tr><td colspan="5"><div class="empty">' +
        '<div class="empty-title">ŽEBŘÍČEK JE PRÁZDNÝ</div>' +
        '<div class="empty-sub">BUĎ PRVNÍ!</div>' +
      '</div></td></tr>';
    $('lb-tbl').style.display = '';
    return;
  }
  const sorted = users.slice().sort((a,b) => (b.elo_rating||1000) - (a.elo_rating||1000));
  const me = currentUser ? currentUser.username : null;
  $('lb-tbody').innerHTML = sorted.map((u, i) => {
    const pos  = i + 1;
    const posC = pos===1?'p1':pos===2?'p2':pos===3?'p3':'';
    const isMe = u.username === me;
    const club = escHtml(u.club_name || u.username);
    const handle = escHtml(u.username);
    return (
      '<tr class="' + (isMe ? 'me' : '') + '">' +
        '<td><div class="lb-pos ' + posC + '">' + pos + '</div></td>' +
        '<td>' +
          '<div class="lb-club-name">' + club + (isMe ? ' &laquo;' : '') + '</div>' +
          '<div class="lb-club-handle">@' + handle + '</div>' +
        '</td>' +
        '<td><div class="lb-elo">' + (u.elo_rating || 1000) + '</div></td>' +
        '<td class="lb-r hide-m" style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:var(--or)">' + (u.level || 1) + '</td>' +
        '<td class="lb-r hide-m" style="color:var(--yw);font-weight:700">' + (u.money || 0) + '</td>' +
      '</tr>'
    );
  }).join('');
  $('lb-tbl').style.display = '';
}
