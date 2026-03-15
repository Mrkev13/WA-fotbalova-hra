# Implementace z 13.03.2026 (Marian / THE_GOAT)

Tento dokument shrnuje kritické opravy a vylepšení databázového schématu a backendové integrity provedené po zpětné vazbě od Hamudyho a testera Tomaga.

## Co bylo implementováno a opraveno

### 1. Oprava transakční bezpečnosti (buy_player_secure)
*   Opravena kritická chyba ve funkci `buy_player_secure`, která způsobovala pád při nákupu hráče kvůli nedefinované proměnné `user_id`.
*   Nyní se ID vlastníka korektně načítá do proměnné `v_owner_id` a je bezpečně ověřováno před provedením nákupu.

### 2. Vyřešení integrity zápasů (Bug FK matches_away_user_id_fkey)
*   Identifikován a vyřešen problém s padajícím zápasem proti botovi. Databáze vyžadovala existujícího uživatele pro cizí klíč i u botů.
*   **Vložen systémový uživatel "Bot" s pevným ID 0** přímo do schématu a inicializačních dat.
*   Provedena konsolidace botů – v databázi byl sjednocen uživatel `BOT` pod ID 0, což zajišťuje 100% kompatibilitu s backendem.

### 3. Kódování a čistota dat
*   Celý soubor `schema.sql` byl převeden do kódování **UTF-8**. To řeší problémy s českou diakritikou (např. pozice "Útočník"), které mohly způsobovat chyby při parsování nebo porovnávání řetězců.
*   Všechny změny byly otestovány manuálními skripty přímo nad databází (ověřeno ID 0 i nákupní logika).

---

## Co se má dělat dále (Next Steps)

1.  **Hlubší logika zápasů**: Aktuálně je simulace zápasu velmi přímočará. Bylo by dobré implementovat detailnější vliv staminy a konkrétních pozic hráčů na výsledek (např. brankář má vyšší váhu při obraně).
2.  **Training Worker**: Máme tabulku `training_queue`, ale potřebujeme automatizovaný proces (worker nebo cron), který po uplynutí 10 sekund trénink dokončí a navýší staty hráče v databázi.
3.  **Frontend-Backend Integration**: Je potřeba propojit uživatelské rozhraní s nově opravenými endpointy `/api/buy_player` a `/api/match/play`, které nyní plně využívají novou DB strukturu.
4.  **Trh s hráči (P2P)**: Implementovat možnost dávat své hráče na trh (změna statusu na `ON_MARKET`) a nechat ostatní hráče je kupovat přes stávající bezpečnou funkci.

---

Všechny tyto změny jsou nyní nahrány na GitHubu a databáze je v konzistentním stavu připravená pro další fázi vývoje.
