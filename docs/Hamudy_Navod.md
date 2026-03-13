# Aktuální úkoly pro @Hamudy (13.03.2026)

Hamudy, databáze je nyní plně opravená a otestovaná. Tady jsou věci, které musíš dořešit ty v backendu/kódu:

### 1. Issue #9: Oprava ELO a XP po přihlášení
V databázi jsou hodnoty ELO a XP uložené správně, ale tvůj login endpoint je neposílá na frontend, takže se tam resetují na výchozích 1000.
- **Soubor:** `backend/src/api/routes.js`
- **Úkol:** Do odpovědi na `/api/login` přidej do objektu `user` pole `elo_rating` a `xp`.

### 2. Issue #8: Průběh zápasu a události
Zápas proti botovi už díky mně (vytvořeno ID 0 v DB) nespadne, ale v UI se zatím nic neděje.
- **Soubor:** `backend/src/api/routes.js` (endpoint `/api/match/play`).
- **Úkol:** Musíš doimplementovat logiku událostí (match events). Buď plň tabulku `match_events` v DB, nebo aspoň v odpovědi API pošli seznam akcí (góly, šance), aby frontend věděl, co má vykreslit.

### 3. Uzavření Issue #6 (Nákup hráče)
Nákup přes funkci `buy_player_secure` je z pohledu DB opraven a funkční. Můžeš to issue na GitHubu uzavřít, jakmile potvrdíš, že ti to v API volání prochází.

Máš čistý stůl, teď je to na tobě! 🚀
