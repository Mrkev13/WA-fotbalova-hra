// ═══════════════════════════════════════════════════
// MARKET
// ═══════════════════════════════════════════════════
async function loadMarket() {
  $('market-loader').classList.add('show');
  $('market-grid').innerHTML = '';
  try {
    const players = await apiFetch('GET', '/market');
    $('market-meta').textContent = players.length + ' HRÁČŮ K DISPOZICI';
    if (!players.length) {
      $('market-grid').innerHTML =
        '<div style="grid-column:1/-1"><div class="empty">' +
          '<div class="empty-title">TRŽIŠTĚ JE PRÁZDNÉ</div>' +
          '<div class="empty-sub">ZKUS ZNOVU POZDĚJI</div>' +
        '</div></div>';
      return;
    }
    const myMoney = currentUser ? (currentUser.money || 0) : 0;
    $('market-grid').innerHTML = players.map(p => {
      const canBuy = myMoney >= (p.market_value || 0);
      const name   = escHtml(p.name     || '—');
      const pos    = escHtml(p.position || '—');
      const stam   = p.stamina != null ? p.stamina : '—';
      return (
        '<div class="market-card" id="mc-' + p.id + '">' +
          '<div class="mc-top">' +
            '<span class="mc-pos">' + pos + '</span>' +
            '<span class="mc-stam">STA ' + stam + '</span>' +
          '</div>' +
          '<div class="mc-name">' + name + '</div>' +
          '<div class="mc-stats">' +
            '<div class="mc-stat"><div class="mc-stat-num atk">' + (p.attack  || 0) + '</div><div class="mc-stat-lbl">ÚTOK</div></div>' +
            '<div class="mc-stat"><div class="mc-stat-num def">' + (p.defense || 0) + '</div><div class="mc-stat-lbl">OBRANA</div></div>' +
          '</div>' +
          '<div class="mc-footer">' +
            '<div>' +
              '<div class="mc-price">' + (p.market_value || 0) + '</div>' +
              '<div class="mc-price-lbl">' + (canBuy ? 'DOSTUPNÉ' : 'NEDOSTATEK MINCÍ') + '</div>' +
            '</div>' +
            '<button class="buy-btn" onclick="buyPlayer(' + p.id + ',' + (p.market_value || 0) + ')" ' + (canBuy ? '' : 'disabled') + '>' +
              (canBuy ? 'KOUPIT' : 'NEDOST.') +
            '</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  } catch (e) {
    $('market-grid').innerHTML =
      '<div style="grid-column:1/-1;padding:32px;color:var(--rd);font-size:11px;letter-spacing:2px">' +
      escHtml(e.message) + '</div>';
  } finally {
    $('market-loader').classList.remove('show');
  }
}

async function buyPlayer(playerId, price) {
  const card = $('mc-' + playerId);
  const btn  = card ? card.querySelector('.buy-btn') : null;
  if (btn) { btn.disabled = true; btn.textContent = 'KUPUJI...'; }
  try {
    await apiFetch('POST', '/buy_player', { playerId });
    if (currentUser) {
      currentUser.money = (currentUser.money || 0) - price;
      saveUser();
      syncTopbar();
    }
    if (card) {
      card.style.outline = '2px solid var(--gn)';
      setTimeout(() => { if (card.parentNode) card.remove(); }, 900);
    }
    try { teamData = await apiFetch('GET', '/team'); } catch (_) {}
  } catch (e) {
    toast('err', e.message);
    if (card) {
      const errEl = document.createElement('div');
      errEl.style.cssText = 'padding:8px 16px;font-size:12px;color:var(--rd);letter-spacing:1px;font-weight:700';
      errEl.textContent = e.message;
      card.querySelector('.mc-footer').appendChild(errEl);
      setTimeout(() => { if (errEl.parentNode) errEl.remove(); }, 4000);
    }
    if (btn) { btn.disabled = false; btn.textContent = 'KOUPIT'; }
  }
}
