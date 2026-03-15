// ═══════════════════════════════════════════════════
// TEAM
// ═══════════════════════════════════════════════════
const trainingActive = {};

async function loadTeam() {
  $('team-loader').classList.add('show');
  $('team-tbody').innerHTML = '';
  try {
    const players = await apiFetch('GET', '/team');
    teamData = players;
    renderTeam(players);
  } catch (e) {
    $('team-tbody').innerHTML =
      '<tr><td colspan="7" style="padding:24px;color:var(--rd);text-align:center">' +
      escHtml(e.message) + '</td></tr>';
  } finally {
    $('team-loader').classList.remove('show');
  }
}

function renderTeam(players) {
  $('team-count').textContent = players.length + ' HRÁČŮ';
  const totAtk = players.reduce((s,p) => s + (p.attack  || 0), 0);
  const totDef = players.reduce((s,p) => s + (p.defense || 0), 0);
  $('ts-atk').textContent   = totAtk;
  $('ts-def').textContent   = totDef;
  $('ts-total').textContent = totAtk + totDef;

  if (!players.length) {
    $('team-tbody').innerHTML =
      '<tr><td colspan="7"><div class="empty">' +
        '<div class="empty-title">ŽÁDNÍ HRÁČI</div>' +
        '<div class="empty-sub">NAKUP HRÁČE NA TRŽIŠTI</div>' +
      '</div></td></tr>';
    return;
  }

  $('team-tbody').innerHTML = players.map((p, i) => {
    const name     = escHtml(p.name     || '—');
    const pos      = escHtml(p.position || '—');
    const safeName = (p.name || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const inTrain  = trainingActive[p.id];
    const atkBtn = (inTrain === 'attack')
      ? '<span class="train-badge" id="tbadge-atk-' + p.id + '">ATK...</span>'
      : '<button class="act-btn act-btn-train" onclick="trainPlayer(' + p.id + ',\'attack\',this)">+1 ATK</button>';
    const defBtn = (inTrain === 'defense')
      ? '<span class="train-badge" id="tbadge-def-' + p.id + '">OBR...</span>'
      : '<button class="act-btn act-btn-train act-btn-def" onclick="trainPlayer(' + p.id + ',\'defense\',this)">+1 OBR</button>';
    return (
      '<tr id="prow-' + p.id + '">' +
        '<td class="idx">' + (i + 1) + '</td>' +
        '<td><strong>' + name + '</strong></td>' +
        '<td class="hide-m"><span class="pos-badge">' + pos + '</span></td>' +
        '<td><div class="stat-big atk">' + (p.attack  || 0) + '</div></td>' +
        '<td><div class="stat-big def">' + (p.defense || 0) + '</div></td>' +
        '<td class="hide-m"><div class="mv-val">' + (p.market_value || 0) + '</div></td>' +
        '<td><div class="act-btns">' +
          atkBtn + defBtn +
          '<button class="act-btn act-btn-fire" onclick="firePlayer(' + p.id + ',\'' + safeName + '\')">PROPUSTIT</button>' +
        '</div></td>' +
      '</tr>'
    );
  }).join('');
}

async function trainPlayer(playerId, statType, btn) {
  if (trainingActive[playerId] === statType) return;
  trainingActive[playerId] = statType;

  const badgeId = 'tbadge-' + (statType === 'attack' ? 'atk' : 'def') + '-' + playerId;
  btn.outerHTML = '<span class="train-badge" id="' + badgeId + '">ODESÍLÁM...</span>';

  try {
    await apiFetch('POST', '/train', { playerId, statType });

    let secs = 10;
    const badge = $(badgeId);
    if (badge) badge.textContent = secs + 's...';

    const iv = setInterval(() => {
      secs--;
      const b = $(badgeId);
      if (b) b.textContent = secs > 0 ? secs + 's...' : 'HOTOVO!';
      if (secs <= 0) {
        clearInterval(iv);
        delete trainingActive[playerId];
        setTimeout(loadTeam, 400);
      }
    }, 1000);

    if (currentUser) {
      currentUser.money = Math.max(0, (currentUser.money || 0) - 50);
      saveUser();
      syncTopbar();
    }

    const label = statType === 'attack' ? 'Útok' : 'Obrana';
    toast('ok', label + ' trénována! -50 mincí');

  } catch (e) {
    delete trainingActive[playerId];
    const b = $(badgeId);
    if (b) {
      const label = statType === 'attack' ? '+1 ATK' : '+1 OBR';
      const cls   = statType === 'attack' ? 'act-btn-train' : 'act-btn-train act-btn-def';
      b.outerHTML = '<button class="act-btn ' + cls + '" onclick="trainPlayer(' + playerId + ',\'' + statType + '\',this)">' + label + '</button>';
    }
    toast('err', e.message);
  }
}

async function firePlayer(playerId, name) {
  if (!confirm('Opravdu propustit hráče ' + (name || '') + '?')) return;
  try { await apiFetch('POST', '/fire_player', { playerId }); } catch (_) {}
  loadTeam();
}
