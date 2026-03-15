// ═══════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════
let token       = localStorage.getItem('pft_token') || null;
let currentUser = JSON.parse(localStorage.getItem('pft_user') || 'null');
let teamData    = [];
let selectedOpp = null;

// ═══════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('pft_theme', isLight ? 'light' : 'dark');
  $('tb-theme').title = isLight ? 'Přepnout tmavý režim' : 'Přepnout světlý režim';
}

(function initTheme() {
  if (localStorage.getItem('pft_theme') === 'light') {
    document.body.classList.add('light-mode');
  }
}());

// ═══════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════
function navActivate(page) {
  document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
    b.classList.toggle('act', b.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('act'));
  const pg = $('page-' + page);
  if (pg) pg.classList.add('act');
}

function navTo(page) {
  navActivate(page);
  if (page === 'team')        loadTeam();
  if (page === 'match')       loadMatch();
  if (page === 'market')      loadMarket();
  if (page === 'leaderboard') loadLeaderboard();
}

// ═══════════════════════════════════════════════════
// APP ENTRY
// ═══════════════════════════════════════════════════
function enterApp() {
  $('s-login').classList.remove('active');
  $('s-app').classList.add('active');
  navActivate('dashboard');
  syncTopbar();
  loadDashboard();
}

function syncTopbar() {
  if (!currentUser) return;
  const club = currentUser.club_name || currentUser.username || '—';
  $('tb-club').textContent   = club;
  $('tb-money').textContent  = currentUser.money      != null ? currentUser.money      : '—';
  $('tb-level').textContent  = currentUser.level      != null ? currentUser.level      : '—';
  $('tb-elo').textContent    = currentUser.elo_rating != null ? currentUser.elo_rating : '—';
  $('dash-club').textContent = club;
  $('sd-money').textContent  = currentUser.money      != null ? currentUser.money + ' mincí' : '—';
  $('sd-level').textContent  = currentUser.level      != null ? currentUser.level      : '—';
  $('sd-elo').textContent    = currentUser.elo_rating != null ? currentUser.elo_rating : '—';
  const xp  = currentUser.xp || 0;
  const cap = Math.max(1, (currentUser.level || 1)) * 100;
  const pct = Math.min(100, Math.round((xp % cap) / cap * 100));
  $('sd-xp-txt').textContent  = xp + ' XP';
  $('sd-xp-fill').style.width = pct + '%';
}

function saveUser() {
  localStorage.setItem('pft_user', JSON.stringify(currentUser));
}

// ═══════════════════════════════════════════════════
// INIT — auto-login pokud je uložená session
// ═══════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function() {
  if (token && currentUser) {
    enterApp();
  }
});
