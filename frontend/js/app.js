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
  // Zavřít burger menu po výběru
  closeBurger();
}

function toggleBurger() {
  const nav = document.getElementById('app-nav');
  const btn = document.getElementById('burger-btn');
  const isOpen = nav.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
}

function closeBurger() {
  const nav = document.getElementById('app-nav');
  const btn = document.getElementById('burger-btn');
  if (nav) nav.classList.remove('open');
  if (btn) btn.classList.remove('open');
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

  // ── Nav tlačítka ─────────────────────────────────
  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navTo(btn.dataset.page));
  });

  // ── Logout ───────────────────────────────────────
  document.querySelectorAll('.tb-logout, .nav-logout-mob').forEach(btn => {
    btn.addEventListener('click', doLogout);
  });

  // ── Theme toggle ─────────────────────────────────
  const themeBtn = document.getElementById('tb-theme');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // ── Burger ───────────────────────────────────────
  const burgerBtn = document.getElementById('burger-btn');
  if (burgerBtn) burgerBtn.addEventListener('click', toggleBurger);

  // ── Login form ───────────────────────────────────
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) btnLogin.addEventListener('click', doLogin);

  const tabLogin = document.getElementById('tab-login');
  if (tabLogin) tabLogin.addEventListener('click', () => switchTab('login'));

  const tabReg = document.getElementById('tab-reg');
  if (tabReg) tabReg.addEventListener('click', () => switchTab('reg'));

  const liUser = document.getElementById('li-user');
  if (liUser) {
    liUser.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    liUser.addEventListener('input', () => clearFieldErr('li-user','ferr-li-user'));
  }
  const liPass = document.getElementById('li-pass');
  if (liPass) {
    liPass.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    liPass.addEventListener('input', () => clearFieldErr('li-pass','ferr-li-pass'));
  }

  // ── Register form ────────────────────────────────
  const btnReg = document.getElementById('btn-reg');
  if (btnReg) btnReg.addEventListener('click', doRegister);

  const reUser = document.getElementById('re-user');
  if (reUser) reUser.addEventListener('input', () => validateRegField('re-user','ferr-re-user',3,'Min. 3 znaky'));

  const reClub = document.getElementById('re-club');
  if (reClub) reClub.addEventListener('input', () => validateRegField('re-club','ferr-re-club',3,'Min. 3 znaky'));

  const rePass = document.getElementById('re-pass');
  if (rePass) rePass.addEventListener('input', () => validateRegField('re-pass','ferr-re-pass',6,'Min. 6 znaků'));

  // ── Dashboard action cards ───────────────────────
  document.querySelectorAll('.action-card[data-nav]').forEach(card => {
    card.addEventListener('click', () => navTo(card.dataset.nav));
  });

  // ── Match tlačítka ───────────────────────────────
  const playBtn = document.getElementById('play-btn');
  if (playBtn) playBtn.addEventListener('click', playMatch);

  const botBtn = document.getElementById('bot-btn');
  if (botBtn) botBtn.addEventListener('click', selectBot);

  // ── Result screen tlačítka ───────────────────────
  document.querySelectorAll('[data-result]').forEach(btn => {
    btn.addEventListener('click', () => closeResult(btn.dataset.result));
  });

  // ── Floating player ──────────────────────────────
  const fp = document.getElementById('floating-player');
  if (fp) fp.addEventListener('click', () => {
    fp.classList.add('run-away');
    setTimeout(() => fp.remove(), 650);
  });

  // ── Auto login ───────────────────────────────────
  if (token && currentUser) {
    enterApp();
  }
});
