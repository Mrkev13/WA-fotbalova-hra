// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════
const API_BASE = 'http://localhost:3000/api';

// ═══════════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════════
const $ = id => document.getElementById(id);

function setMsg(id, type, text) {
  const el = $(id);
  el.className = 'msg ' + type;
  el.textContent = text;
}
function clearMsg(id) {
  const el = $(id);
  el.className = 'msg';
  el.textContent = '';
}
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(type, text) {
  const container = $('toast-container');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 4000);
}

function validateRegField(inputId, errId, minLen, errText) {
  const input = $(inputId);
  const errEl = $(errId);
  const val = input.value;
  if (val.length > 0 && val.length < minLen) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    errEl.textContent = errText;
    errEl.classList.add('show');
  } else if (val.length >= minLen) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    errEl.classList.remove('show');
  } else {
    input.classList.remove('invalid','valid');
    errEl.classList.remove('show');
  }
}

function clearFieldErr(inputId, errId) {
  const input = $(inputId);
  const errEl = $(errId);
  if (input) { input.classList.remove('invalid'); }
  if (errEl) { errEl.classList.remove('show'); }
}

function showFieldErr(inputId, errId, text) {
  const input = $(inputId);
  const errEl = $(errId);
  if (input) { input.classList.add('invalid'); input.focus(); }
  if (errEl) { errEl.textContent = text; errEl.classList.add('show'); }
}

// ═══════════════════════════════════════════════════
// API WRAPPER
// ═══════════════════════════════════════════════════
async function apiFetch(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token)              opts.headers['Authorization'] = 'Bearer ' + token;
  if (body !== undefined) opts.body = JSON.stringify(body);
  let res;
  try {
    res = await fetch(API_BASE + path, opts);
  } catch (_) {
    throw new Error('Nelze se spojit se serverem. Je backend spuštěný?');
  }
  let data = {};
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
  return data;
}
