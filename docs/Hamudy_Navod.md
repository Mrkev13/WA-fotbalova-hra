# Návod pro Backend (Pro @Hamudy)

Tento dokument je "blbuvzdorný" návod, jak napojit API na naši novou PostgreSQL databázi a co přesně máš naprogramovat v backendu.

🔥 **POZOR: Databáze je v PostgreSQL. Nepoužívej SQLite dotazy! V SQL příkazech používej `INSERT INTO ... RETURNING id` pro získání ID, nikoliv `last_insert_rowid()`.**

---

## 1. Jak fungujeme s databází a konfigem

- **Schéma DB**: Podívej se do `backend/src/models/schema.sql`. Všechny tabulky jsou tam definované. Názvy sloupců musíš v SQL dotazech dodržet přesně!
- **Konfigurace Ekonomiky**: Ceny a odměny NAPIŠ NATVRDO DO KÓDU, ale načti je ze souboru `backend/src/services/economy_config.json`. Když se The GOAT rozhodne změnit cenu tréninku, změní jen tento JSON a ty nesmíš sahat do kódu.

---

## 2. Tvůj úkol 1: Generování hráčů (Bod 3A)

Až se uživatel zaregistruje (nebo až zavoláš funkci pro získání nových hráčů), musíš mu vygenerovat **11 náhodných fotbalistů**.

**Jak na to:**
1. Vytáhni si namixovaná jména z tabulek `first_names` a `last_names`. Třeba přes SQL: `SELECT name FROM first_names ORDER BY RANDOM() LIMIT 1` (a to samé pro last_names).
2. Spoj je dohromady (př: "Karel" + " " + "Novák").
3. Vygeneruj pro něj statistiky (Podle našeho omezení v DB musí být **od 10 do 100**):
   - Útok: `random_int(10, 50)`
   - Obrana: `random_int(10, 50)`
4. Nastav jim pozici (např. náhodný výběr z 'Útočník', 'Záložník', 'Obránce', 'Brankář').
5. Vypočítej `market_value = (attack + defense) * 10`.
6. Těchto 11 hráčů pomocí `INSERT INTO players` přiřaď novému `user_id`.

---

## 3. Tvůj úkol 2: Simulace zápasu (Bod 3B)

Zápas spouštíš na endpointu `/api/match/play`. Přijmeš ID soupeře (away_user_id) a ID hráče z jeho tokenu (home_user_id).

**Algoritmus:**
1. Sečti Útok a Obranu obou týmů. Kádr vytáhneš z `players WHERE user_id = X AND status = 'IN_TEAM'`.
   - $Home_{Attack}$, $Home_{Defense}$
   - $Away_{Attack}$, $Away_{Defense}$
2. Podle zadání přičteš náhodu `-10% až +10%` k finální síle.
3. Simuluj zápas opakovaně na pár šancí (třeba 5 "útoků" za zápas). Pokud upravený $Home_{Attack} > Away_{Defense}$, padne gól (home_score += 1).
4. **Zápis výsledku:**
   - Zapiš výsledek do tabulky `matches`.
   - Přičti XP (např. +10 za výhru) oběma do `users.xp`.
   - Uprav `money` v tabulce `users` (výhra: +100, prohra: +20 – vem to z JSONu).
   - Upravit **ELO hodnocení** v `users.elo_rating` přes jednoduchý matematický výpočet.

---

## 4. Tvůj úkol 3: Seznam API Endpointů (Bod 6)

Tyto routy vytvoříš a naplníš logikou v `backend/src/api`:

*   `POST /api/register` – Založení účtu. Hashuj hesla!
*   `POST /api/login` – Vrátí random session token. Ten uložíš do tabulky `sessions`.
*   `GET /api/team` – Ověří Token, najde `user_id` a vrátí SELECT z `players`.
*   `GET /api/market` – Udělá SELECT nad hráči s podmínkou `status = 'ON_MARKET'` nebo `user_id IS NULL`.
*   `POST /api/buy_player` – Odečte peníze hráči, a dá hráči `user_id = MojeId` a `status = 'IN_TEAM'`. Nezapomeň, že v logice **musíš** zjistit, kolik hráč stojí!
*   `POST /api/match/play` – Spustí zápas, uloží výsledek, zapíše finance a elo a vrátí odpověď s výsledkem.

---

## 5. Zabezpečení plateb (Transakce přes DB funkci)

Aby se nestalo, že API spadne v půlce nákupu (peníze se strhnou, ale hráč se nepřevede), **neřeš nákup hráče manuálním updatováním databáze ve tvém kódu!**

V databázi jsem vytvořil speciální PL/pgSQL funkci `buy_player_secure(buyer_id, player_id)`. 

**Co musíš udělat v API:**
Stačí zavolat jediný SQL dotaz:
```sql
SELECT buy_player_secure(123, 45); 
-- Kde 123 je ID kupujícího a 45 je ID hráče
```

A databáze si **sama, bezpečně a atomicky** vyřeší:
- Ověření, že je hráč na trhu.
- Ověření, že má kupující dostatek financí (strhne z money).
- Odepsání hráče na nového majitele (`status = 'IN_TEAM'`).
- Vygenerování detailního logu do tabulky `transactions`.

Pokud nemá kupující peníze nebo hráč neexistuje, tato funkce rovnou hodí přehledný **SQL Error/Exception** (např. *'Nedostatek peněz na účtu.'*), který jen odchytíš ve svém backend (try/catch) a pošleš na frontend jako 400 Bad Request.

Good luck! 🚀
