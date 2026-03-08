# Implementace z 08.03.2026

Tento dokument slouží jako záznam úprav a implementací, které byly provedeny v datovém modelu a konfiguracích dne 8. března. (Marian / THE_GOAT)

## Co bylo implementováno

### 1. Inicializace datového modelu (Zadání bod 5)
- Vytvořena kostra pro tabulky `users`, `players`, `matches` v souboru `backend/src/models/schema.sql`.
- Soubor `dbinfo.md` s popisem relačních vztahů.

### 2. Implementace ekonomiky (Zadání bod 4)
- Vytvořen konfigurační soubor `backend/src/services/economy_config.json`, který definuje startovní kapitál, odměny za zápasy a pokuty/ceny tréninků.

### 3. Migrace z SQLite na PostgreSQL
- Identifikován problém s `AUTOINCREMENT` a schema bylo přepsáno pro PostgreSQL syntax využitím `SERIAL PRIMARY KEY`.
- Přidán nezbytný sloupec `xp` do tabulky `users` pro sledování progresu (Zadání bod 3C).

### 4. Robustní integrita a constraints
- Aplikováno kaskádové umazávání na zápasy (`ON DELETE CASCADE`), aby nezůstávala "viset" neplatná data po smazání uživatele.
- Hráčům bylo nastaveno `ON DELETE SET NULL`, aby prodejem/smazáním majitele nezmizeli z trhu.
- Přidány logické pojistky (CHECK), např. zákaz hrát zápas sám se sebou, zákaz záporných stavů u peněz a skóre.

### 5. Komplexní "10 Námětů" vylepšení databáze a mechanik
Dle požadavku byly do datového schématu zakomponovány tyto vlastnosti a mechaniky přesahující běžné MVP znění, avšak respektující jeho myšlenku:

*   **Příprava na denní bonus:** Přidán sloupec `last_daily_bonus` do `users` pro logování 24h cyklů z ekonomiky.
*   **Pozice hráčů:** Přidán sloupec `position` (Útočník, Záložník, Obránce, Brankář, Universal) pro budoucí strategii sestavy.
*   **Hard-cap na staty:** Přidány CHECK horní meze na `attack <= 100` a `defense <= 100`, aby šlo hráče dotrénovat pouze do rozumné hranice a nešlo o "nekonečný" farm fest.
*   **Stamina/Únava:** Přidán sloupec `stamina` (0-100), aby se zohlednil management svalů hráčů.
*   **Stavy hráčů:** Volní vs zabraní vs odešlí do důchodu jsou odlišeni logickým sloupcem `status` (ON_MARKET, IN_TEAM, RETIRED). Umožňuje to snazší práci s trhem.
*   **Logování financí:** Vytvořena detailní tabulka `transactions`, ke které se svede veškerý finanční provoz. Pomáhá odhalit bugy v ekonomice či exploity.
### 6. Příprava styčných bodů s API a Výkon (Dalších 5 změn)
V návaznosti na to bylo dále doplněno a ošetřeno ještě několik chybějících dílků z návrhu zadání tak, aby se na to snáz navazovalo klukům v API týmu:

*   **Leaderboard připravenost (`elo_rating`):** Pro smysluplný žebříček z bodu 7 byl hráčům do tabulky `users` připraven sloupec Elo, který se bude měnit po každém zápasu. Získáme tak soutěživou formu!
*   **Čekárna na trénink (`training_queue`):** Zhmotněno zadání z bodu 4, kdy trénink trvá 10 sekund. Tabulka drží log kdo trénuje, do kdy a jaký získá atribut.
*   **API Přihlašování (`sessions`):** Z bodu 6 (Login vrací token) vznikla databázová evidence těchto session tokenů pro ověření stavu uživatelů při volání API. Zvyšuje to reálnou aplikační bezpečnost.
*   **Generátor Jmen (`first_names`, `last_names`):** Podle vymyšlení (Bod 3 - např. Karel Novák) vznikly slovníkové tabulky s prvotním plněním 10 českých jmen a příjmení pro random skládání SQL scriptem během generování.
*   **Výkonnost databáze (Indexy):** Všechny prohledávací klíče a důležité relace napříč db získaly explicitní postgre `INDEX`, abychom nezatížili server, jakmile začne tabulka uživatelů růst a bude se nad ní volat dashboard.

### 7. Zabezpečení nákupů na úrovni databáze (Stored Procedure)
Navzdory API manuálu byla přidána přímo do PostgreSQL procedura `buy_player_secure(buyer_id, player_id)`, která zajišťuje 100% ACID atomicitu. Pokud by Hamudy pochybil při psaní transakce, hrozil by přepis (race condition) financí. Nyní backend stačí zavolat 1 SQL funkci, která sama ověří stav konta, odečte finance, upraví majitele a zaloguje to v jednom bloku.

