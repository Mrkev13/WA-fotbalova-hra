# Report o technických incidentech v projektu (Simulace sabotáže)

Tento dokument shrnuje tři kritické incidenty, ke kterým došlo během vývoje aplikace, popisuje jejich příčiny, způsob odhalení a následnou nápravu.

---

### Incident č. 1: Pád deploymentu (Missing IF NOT EXISTS)
**Popis**: Při pokusu o aktualizaci produkčního prostředí na platformě Render došlo k okamžitému selhání buildu. Aplikace nebyla schopna nastartovat novou verzi.

**Technická příčina**: V SQL souboru `schema.sql` byla z definice tabulky `users` omylem odstraněna klauzule `IF NOT EXISTS`. Skript se tedy snažil vytvořit tabulku, která již v produkční databázi existovala, což PostgreSQL vyhodnotil jako fatální chybu.

**Způsob odhalení**: 
1. Kontrola logů v Render Dashboardu.
2. Identifikace chyby: `error: relation "users" already exists`.
3. Revize posledních změn v `schema.sql`.

**Náprava**: Navrácení klauzule `IF NOT EXISTS` ke všem tabulkám, čímž se SQL skripty staly opět idempotentní.

---

### Incident č. 2: Rozpad integrační vrstvy (Rename user_id -> owner_id)
**Popis**: Po provedení "kosmetické úpravy" názvů v databázi přestala fungovat sekce "Můj tým" a "Trh hráčů". API endpointy vracely chybu 500 (Internal Server Error).

**Technická příčina**: Došlo k přejmenování sloupce `user_id` na `owner_id` v tabulce `players`. Tato změna byla provedena v databázi, ale nebyla reflektována v backendovém kódu (`routes.js`), který stále prováděl dotazy na neexistující sloupec `user_id`.

**Způsob odhalení**: 
1. Sledování konzole serveru při pokusu o přístup k API.
2. Odchycení chyby: `column "user_id" does not exist at character ...`.
3. Vyhledání všech výskytů starého názvu v backendu.

**Náprava**: Sjednocení názvosloví napříč celou aplikací (návrat k `user_id` pro zachování zpětné kompatibility).

---

### Incident č. 3: Nefunkční produkce (Hardcoded localhost)
**Popis**: Aplikace bezchybně fungovala všem vývojářům na jejich počítačích, ale po nahrání na veřejnou URL adresu se externí testeři nemohli přihlásit.

**Technická příčina**: V souboru `frontend/js/api.js` byla konstanta `API_BASE` nastavena na pevnou adresu `http://localhost:3000/api`. Prohlížeč uživatele se tedy snažil komunikovat s jeho vlastním počítačem místo se serverem na Renderu.

**Způsob odhalení**: 
1. Použití nástroje Chrome DevTools – záložka **Network**.
2. Zjištění, že všechny fetch požadavky končí chybou `ERR_CONNECTION_REFUSED` a směřují na nesprávnou adresu.

**Náprava**: Změna `API_BASE` na relativní cestu `/api`, což zajistí správné směrování požadavků bez ohledu na doménu.

---

**Závěr**: Všechny incidenty byly úspěšně vyřešeny a projekt je nyní stabilní a plně funkční v produkčním prostředí.
