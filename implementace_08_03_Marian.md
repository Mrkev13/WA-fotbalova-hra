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
*   **Logy zápasů:** Vytvořena tabulka `match_events`, abychom kromě strohého výsledku zachovali i sled událostí na hřišti (pro výpis "Novák dává Gól!").

*(Pozn.: Ošetření triggery, jako je např. limit soupisky maximálně na 11 hráčů, a odečet peněz pomocí SQL funkcí bude součástí aplikační vrstvy backend logika - @Hamudy)*
