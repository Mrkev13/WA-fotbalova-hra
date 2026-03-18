// ═══════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════
function switchTab(tab) {
  $('tab-login').classList.toggle('act', tab === 'login');
  $('tab-reg').classList.toggle('act',   tab === 'reg');
  $('form-login').style.display = tab === 'login' ? '' : 'none';
  $('form-reg').style.display   = tab === 'reg'   ? '' : 'none';
}

async function doLogin() {
  const username = $('li-user').value.trim();
  const password = $('li-pass').value;

  if (!username) {
    showFieldErr('li-user', 'ferr-li-user', 'Zadejte uživatelské jméno.');
    setMsg('msg-login','err','Vyplňte všechna pole.');
    return;
  }
  if (!password) {
    showFieldErr('li-pass', 'ferr-li-pass', 'Zadejte heslo.');
    setMsg('msg-login','err','Vyplňte všechna pole.');
    return;
  }

  clearMsg('msg-login');
  const btn = $('btn-login');
  btn.disabled = true; btn.textContent = 'PŘIHLAŠOVÁNÍ...';
  try {
    const data = await apiFetch('POST', '/login', { username, password });
    token = data.token;
    currentUser = Object.assign({ username }, data.user || {});
    localStorage.setItem('pft_token', token);
    localStorage.setItem('pft_user', JSON.stringify(currentUser));
    enterApp();
  } catch (e) {
    const msg = e.message;
    if (msg.includes('nenalezen') || msg.includes('not found')) {
      showFieldErr('li-user', 'ferr-li-user', 'Uživatel neexistuje.');
      setMsg('msg-login','err','Uživatel s tímto jménem neexistuje.');
    } else if (msg.includes('heslo') || msg.includes('password') || msg.includes('Špatné')) {
      showFieldErr('li-pass', 'ferr-li-pass', 'Špatné heslo.');
      setMsg('msg-login','err','Špatné heslo. Zkuste to znovu.');
    } else {
      setMsg('msg-login','err', msg);
    }
    btn.disabled = false; btn.textContent = 'PŘIHLÁSIT SE';
  }
}

async function doRegister() {
  const username  = $('re-user').value.trim();
  const club_name = $('re-club').value.trim();
  const password  = $('re-pass').value;

  if (!username || !club_name || !password) {
    if (!username)  showFieldErr('re-user','ferr-re-user','Pole je povinné.');
    if (!club_name) showFieldErr('re-club','ferr-re-club','Pole je povinné.');
    if (!password)  showFieldErr('re-pass','ferr-re-pass','Pole je povinné.');
    setMsg('msg-reg','err','Vyplňte všechna pole.');
    return;
  }
  if (username.length < 3) {
    showFieldErr('re-user','ferr-re-user','Min. 3 znaky.');
    setMsg('msg-reg','err','Uživatelské jméno musí mít alespoň 3 znaky.');
    return;
  }
  if (club_name.length < 3) {
    showFieldErr('re-club','ferr-re-club','Min. 3 znaky.');
    setMsg('msg-reg','err','Název klubu musí mít alespoň 3 znaky.');
    return;
  }
  if (password.length < 6) {
    showFieldErr('re-pass','ferr-re-pass','Min. 6 znaků.');
    setMsg('msg-reg','err','Heslo musí mít alespoň 6 znaků.');
    return;
  }

  clearMsg('msg-reg');
  const btn = $('btn-reg');
  btn.disabled = true; btn.textContent = 'REGISTRACE...';
  try {
    await apiFetch('POST', '/register', { username, club_name, password });
    setMsg('msg-reg','ok','Účet vytvořen! Přihlašování...');
    setTimeout(async () => {
      $('li-user').value = username;
      $('li-pass').value = password;
      switchTab('login');
      await doLogin();
    }, 800);
  } catch (e) {
    const msg = e.message;
    if (msg.toLowerCase().includes('duplicate key') || msg.toLowerCase().includes('unique')) {
      if (msg.includes('club_name') || msg.includes('club')) {
        showFieldErr('re-club','ferr-re-club','Název klubu je již obsazen.');
        setMsg('msg-reg','err','Tento název klubu už používá jiný hráč. Zvolte jiný.');
      } else {
        showFieldErr('re-user','ferr-re-user','Jméno je již obsazeno.');
        setMsg('msg-reg','err','Toto uživatelské jméno je již obsazeno. Zvolte jiné.');
      }
    } else {
      setMsg('msg-reg','err', msg);
    }
    btn.disabled = false; btn.textContent = 'REGISTROVAT SE';
  }
}

function doLogout() {
  token = null; currentUser = null; teamData = []; selectedOpp = null;
  localStorage.removeItem('pft_token');
  localStorage.removeItem('pft_user');
  $('s-app').classList.remove('active');
  $('s-login').classList.add('active');
  navActivate('dashboard');
}
