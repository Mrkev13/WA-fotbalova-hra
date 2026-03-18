// ═══════════════════════════════════════════════════
// MATCH
// ═══════════════════════════════════════════════════
let matchLiveInterval = null;

async function loadMatch() {
  if (!teamData.length) {
    try { teamData = await apiFetch('GET', '/team'); } catch (_) {}
  }
  const myAtk = teamData.reduce((s,p) => s + (p.attack  || 0), 0);
  const myDef = teamData.reduce((s,p) => s + (p.defense || 0), 0);
  const playerCount = teamData.length;

  $('mh-my-name').textContent = currentUser
    ? (currentUser.club_name || currentUser.username || '—') : '—';
  $('mh-my-atk').textContent = myAtk;
  $('mh-my-def').textContent = myDef;

  const playBtn = $('play-btn');
  if (playerCount !== 11) {
    playBtn.disabled = true;
    $('match-opp-info').textContent =
      'Máš ' + playerCount + ' hráčů. Pro zápas potřebuješ přesně 11. ' +
      (playerCount < 11 ? 'Nakup hráče na tržišti.' : 'Propusť ' + (playerCount - 11) + ' hráčů.');
    $('match-opp-info').style.color = 'var(--rd)';
  } else {
    playBtn.disabled = false;
    $('match-opp-info').textContent = 'Vyber soupeře vpravo nebo hraj proti botovi.';
    $('match-opp-info').style.color = '';
  }

  $('match-setup').style.display  = '';
  $('match-live').style.display   = 'none';
  $('match-log').style.display    = 'none';
  selectedOpp = null;
  $('bot-btn').style.opacity = '1';
  playBtn.textContent = '⚽ ZAHRÁT ZÁPAS';

  loadOpponents();
}

async function loadOpponents() {
  $('opp-loader').classList.add('show');
  $('opp-list').innerHTML = '';
  try {
    const users  = await apiFetch('GET', '/leaderboard');
    const myName = currentUser ? currentUser.username : null;
    const others = users.filter(u => u.username !== myName).slice(0, 10);
    if (!others.length) {
      $('opp-list').innerHTML = '<div style="font-size:10px;color:var(--mut);letter-spacing:2px;padding:8px 0">Žádní dostupní soupeři.</div>';
    } else {
      $('opp-list').innerHTML = others.map(u => {
        const club     = escHtml(u.club_name || u.username);
        const safeClub = (u.club_name || u.username || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        const elo      = u.elo_rating || 1000;
        return (
          '<div class="opp-row" id="opp-' + u.id + '" onclick="selectOpponent(' + u.id + ',\'' + safeClub + '\',' + elo + ')">' +
            '<div><div class="opp-name">' + club + '</div><div class="opp-handle">@' + escHtml(u.username) + '</div></div>' +
            '<div class="opp-elo">ELO ' + elo + '</div>' +
          '</div>'
        );
      }).join('');
    }
  } catch (_) {
    $('opp-list').innerHTML = '<div style="font-size:10px;color:var(--mut);letter-spacing:2px;padding:8px 0">Nepodařilo se načíst soupeře.</div>';
  } finally {
    $('opp-loader').classList.remove('show');
  }
}

function selectOpponent(id, clubName, elo) {
  selectedOpp = id;
  document.querySelectorAll('.opp-row').forEach(r => r.classList.remove('sel'));
  const el = $('opp-' + id);
  if (el) el.classList.add('sel');
  $('bot-btn').style.opacity      = '0.4';
  $('match-opp-info').textContent = 'SOUPEŘ: ' + clubName + ' (ELO ' + elo + ')';
  $('match-opp-info').style.color = 'var(--or)';
}

function selectBot() {
  selectedOpp = null;
  document.querySelectorAll('.opp-row').forEach(r => r.classList.remove('sel'));
  $('bot-btn').style.opacity      = '1';
  $('match-opp-info').textContent = 'Hraješ proti náhodnému botovi.';
  $('match-opp-info').style.color = 'var(--yw)';
}

// ── Live simulace ──────────────────────────────────
function showMatchLive(homeTeam, awayTeam) {
  $('ml-home-name').textContent  = homeTeam;
  $('ml-away-name').textContent  = awayTeam;
  $('ml-score-home').textContent = '0';
  $('ml-score-away').textContent = '0';
  $('ml-progress-bar').style.width = '0%';
  $('ml-minute').textContent = '0\'';
  $('ml-event').textContent  = 'Rozhodčí pískal výkop...';
  $('ml-event').classList.remove('flash');
  $('match-live').style.display  = '';
  $('match-setup').style.display = 'none';
}

function hideMatchLive() {
  $('match-live').style.display = 'none';
  if (matchLiveInterval) { clearInterval(matchLiveInterval); matchLiveInterval = null; }
}

function runLiveSimulation(homeTeam, awayTeam, onDone) {
  showMatchLive(homeTeam, awayTeam);
  const events = [
    { min: 3,  text: 'Rozehrání ze středového kruhu.' },
    { min: 12, text: 'Nebezpečná situace před brankářem!' },
    { min: 23, text: 'Rohový kop pro domácí.' },
    { min: 31, text: 'Brankář zasahuje! Skvělý zákrok.' },
    { min: 38, text: 'Žlutá karta! Faul v půlce hřiště.' },
    { min: 45, text: 'Poločas. Hráči odcházejí do šatny.' },
    { min: 52, text: 'Druhý poločas začíná.' },
    { min: 61, text: 'Střela z dálky!!' },
    { min: 70, text: 'Střídání — nová energie na hřišti.' },
    { min: 78, text: 'Tlak hostujícího týmu!' },
    { min: 84, text: 'Velká šance — minul o kousek!' },
    { min: 90, text: 'Poslední minuty zápasu...' },
  ];
  let currentMin = 0;
  let eventIdx   = 0;
  const TOTAL_MS = 3000;
  const STEP_MS  = 50;
  const STEPS    = TOTAL_MS / STEP_MS;

  matchLiveInterval = setInterval(() => {
    currentMin = Math.min(90, currentMin + (90 / STEPS));
    $('ml-progress-bar').style.width = ((currentMin / 90) * 100) + '%';
    $('ml-minute').textContent = Math.floor(currentMin) + '\'';

    if (eventIdx < events.length && currentMin >= events[eventIdx].min) {
      const evEl = $('ml-event');
      evEl.textContent = events[eventIdx].text;
      evEl.classList.add('flash');
      setTimeout(() => evEl.classList.remove('flash'), 500);
      eventIdx++;
    }
    if (currentMin >= 90) {
      clearInterval(matchLiveInterval);
      matchLiveInterval = null;
      $('ml-minute').textContent = '90\'';
      $('ml-event').textContent  = 'Konec zápasu!';
      setTimeout(onDone, 400);
    }
  }, STEP_MS);
}

// ── Play ───────────────────────────────────────────
async function playMatch() {
  const btn = $('play-btn');
  btn.disabled = true; btn.textContent = 'SIMULUJI...';

  const homeTeam = currentUser ? (currentUser.club_name || currentUser.username || 'MŮJ TÝM') : 'MŮJ TÝM';
  let awayTeam = 'BOT';
  if (selectedOpp != null) {
    const oppRow = $('opp-' + selectedOpp);
    if (oppRow) {
      const nameEl = oppRow.querySelector('.opp-name');
      if (nameEl) awayTeam = nameEl.textContent;
    }
  }

  const apiPromise = apiFetch('POST', '/match/play',
    selectedOpp != null ? { away_user_id: selectedOpp } : {}
  );

  runLiveSimulation(homeTeam, awayTeam, async () => {
    hideMatchLive();
    try {
      const result = await apiPromise;
      if (!result || !result.score) throw new Error('Server vrátil neplatnou odpověď. Zkuste to znovu.');

      const moneyEarned = parseInt((result.reward  || '').replace(/[^0-9-]/g,'')) || 0;
      const xpEarned    = parseInt((result.xp       || '').replace(/[^0-9-]/g,'')) || 0;
      const eloChange   = parseInt((result.elo_diff || '').replace(/[^0-9-]/g,'')) || 0;

      if (currentUser) {
        currentUser.money      = (currentUser.money      || 0) + moneyEarned;
        currentUser.xp         = (currentUser.xp         || 0) + xpEarned;
        currentUser.elo_rating = (currentUser.elo_rating || 1000) + eloChange;
        saveUser();
        syncTopbar();
      }

      showLastMatchBanner(result);
      showResultScreen(result, moneyEarned, xpEarned, eloChange);
      buildMatchLog(result);

    } catch (e) {
      $('match-setup').style.display = '';
      $('match-opp-info').textContent = 'Chyba: ' + e.message;
      $('match-opp-info').style.color = 'var(--rd)';
      toast('err', e.message);
      btn.disabled = false; btn.textContent = '⚽ ZAHRÁT ZÁPAS';
    }
  });
}

// ── Result screen (fullscreen) ─────────────────────
function showResultScreen(result, moneyEarned, xpEarned, eloChange) {
  const isWin  = (result.message || '').includes('Vyhr');
  const isDraw = (result.message || '').includes('Rem');

  const screen = $('result-screen');
  screen.className = 'result-screen active ' + (isWin ? 'win' : isDraw ? 'draw' : 'lose');

  $('result-emoji').textContent  = isWin ? '🏆' : isDraw ? '🤝' : '😔';
  $('result-label').textContent  = isWin ? 'VÝHRA!' : isDraw ? 'REMÍZA' : 'PROHRA';
  $('result-score').textContent  = result.score || '?';
  $('result-msg').textContent    = escHtml(result.message || '');
  $('result-money').textContent  = (moneyEarned >= 0 ? '+' : '') + moneyEarned;
  $('result-xp').textContent     = (xpEarned    >= 0 ? '+' : '') + xpEarned;
  $('result-elo').textContent    = (eloChange   >= 0 ? '+' : '') + eloChange;

  // Zamknout scroll pod result-screen
  document.body.style.overflow = 'hidden';
}

function closeResult(destination) {
  const screen = $('result-screen');
  screen.classList.remove('active');
  document.body.style.overflow = '';

  // Reset match stránky
  resetMatch();

  // Navigace podle tlačítka
  navTo(destination || 'dashboard');

  // Vyčistit result log
  const rlb = $('result-log-body');
  if (rlb) rlb.innerHTML = '';
}

function resetMatch() {
  selectedOpp = null;
  document.querySelectorAll('.opp-row').forEach(r => r.classList.remove('sel'));
  $('bot-btn').style.opacity = '1';
  $('match-setup').style.display = '';
  $('match-live').style.display  = 'none';
  $('match-log').style.display   = 'none';

  const pb = $('play-btn');
  pb.textContent = '⚽ ZAHRÁT ZÁPAS';

  const playerCount = teamData.length;
  if (playerCount !== 11) {
    pb.disabled = true;
    $('match-opp-info').textContent =
      'Máš ' + playerCount + ' hráčů. Pro zápas potřebuješ přesně 11. ' +
      (playerCount < 11 ? 'Nakup hráče na tržišti.' : 'Propusť ' + (playerCount - 11) + ' hráčů.');
    $('match-opp-info').style.color = 'var(--rd)';
  } else {
    pb.disabled = false;
    $('match-opp-info').textContent = 'Vyber soupeře vpravo nebo hraj proti botovi.';
    $('match-opp-info').style.color = '';
  }
}

// ── Match log ──────────────────────────────────────
function buildMatchLog(result) {
  const parts    = (result.score || '0:0').split(':');
  const myGoals  = Math.max(0, parseInt(parts[0].trim()) || 0);
  const oppGoals = Math.max(0, parseInt(parts[1] ? parts[1].trim() : '0') || 0);

  const rand = n => Array.from({length: n}, () => Math.floor(Math.random()*88)+1).sort((a,b)=>a-b);
  const myMins  = rand(myGoals);
  const oppMins = rand(oppGoals);

  const events = [
    {m: 0, own: null, cls: '', text: 'VÝKOP! Zápas začíná.'},
    ...myMins.map(m  => ({m, own: true,  cls: 'goal',     text: null})),
    ...oppMins.map(m => ({m, own: false, cls: 'goal-opp', text: null})),
  ].sort((a,b) => a.m - b.m);

  const sc = [0,0];
  const rows = events.map(ev => {
    if (ev.own === true)  { sc[0]++; return {m: ev.m, cls: 'goal',     text: '<strong>GÓL!</strong> Náš útok pronikl obranou &mdash; ' + sc[0] + ':' + sc[1]}; }
    if (ev.own === false) { sc[1]++; return {m: ev.m, cls: 'goal-opp', text: 'Soupeř skóruje &mdash; ' + sc[0] + ':' + sc[1]}; }
    return {m: ev.m, cls: '', text: ev.text};
  });

  const isWin  = (result.message || '').includes('Vyhr');
  const isDraw = (result.message || '').includes('Rem');
  rows.push({m: 90, cls: isWin ? 'win' : isDraw ? '' : 'lose', text: '<strong>KONEC ZÁPASU</strong> &mdash; ' + escHtml(result.message || '')});

  // Vyplnit oba logy — match stránka i result screen
  const targets = ['match-log-body', 'result-log-body']
    .map(id => $(id)).filter(Boolean);
  targets.forEach(b => b.innerHTML = '');

  rows.forEach((ev, i) => {
    setTimeout(() => {
      targets.forEach(body => {
        const div = document.createElement('div');
        div.className = 'log-row ' + ev.cls + ' log-hidden';
        div.innerHTML =
          '<div class="log-min">' + ev.m + '\'</div>' +
          '<div class="log-dot"></div>' +
          '<div>' + ev.text + '</div>';
        body.appendChild(div);
        setTimeout(() => div.classList.remove('log-hidden'), 20);
      });
    }, i * 300);
  });
}
