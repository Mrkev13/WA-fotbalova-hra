# Pixel Football Tycoon

**Zahraj si hru online zde:** [https://wa-fotbalova-hra.onrender.com/](https://wa-fotbalova-hra.onrender.com/)

Pixel Football Tycoon je webový fotbalový manažer vytvořený jako studentský projekt (MVP). Umožňuje hráčům založit si vlastní fotbalový klub, spravovat svůj tým, nakupovat nové hráče na trhu a hrát zápasy proti ostatním manažerům.

##  Hlavní funkce
* **Registrace a Login:** Každý nový manažer získá do začátku základní kapitál a je mu náhodně vygenerována základní jedenáctka hráčů s různými statistikami.
* **Klubovna (Dashboard):** Přehled o stavu účtu, úrovni klubu (Level), zkušenostech (XP) a ELO ratingu.
* **Správa týmu:** Zobrazení aktuální sestavy a celkové síly týmu (útok/obrana).
* **Tržiště (Market):** Nákup nových posil do týmu. Hráči s lepšími statistikami a větším potenciálem stojí více peněz. Bezpečné transakce jsou ošetřeny na úrovni databáze.
* **Simulace zápasů:** Hraní zápasů proti skutečným hráčům s automatickým výpočtem skóre na základě síly obou týmů a špetky náhody.
* **Herní ekonomika:** Odměny v podobě mincí, XP a ELO bodů za odehrané a vyhrané zápasy.

##  Použité technologie
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API pro komunikaci se serverem)
* **Backend:** Node.js, Express.js (tvorba REST API)
* **Databáze:** PostgreSQL (s využitím PL/pgSQL funkcí pro bezpečnost plateb)
* **Hosting a nasazení:** Render.com (Web Service & Managed PostgreSQL)


## Použité technologie a závislosti (Backend)
Pro běh serveru a jeho bezpečnost využíváme následující externí knihovny:
* **express**: Webový framework pro běh serveru a poskytování API.
* **pg**: Databázový klient pro připojení k PostgreSQL.
* **bcrypt**: Bezpečné hashování a ukládání uživatelských hesel.
* **helmet** & **cors**: Nastavení bezpečnostních HTTP hlaviček a správa přístupu k API.
* **compression**: Zmenšení velikosti přenášených dat (GZIP).
* **dotenv**: Načítání tajných proměnných z prostředí mimo zdrojový kód.
* **terser** & **clean-css-cli**: Dev nástroje pro minifikaci frontendového JS a CSS kódu.

## Nasazení aplikace (Deployment)

Aplikace běží na platformě Render. Tým používá následující postup pro nasazení:

1. **Příprava:** Standa (nebo pověřený člen) provede kontrolu závislostí (`npm run check-updates`).
2. **Commit a Push:** Změny se pushnou do hlavní větve repozitáře na GitHubu.
3. **Automatický build:** Render automaticky detekuje nový kód a spustí příkaz `npm run build`.
4. **Nasazení bez výpadku (Zero-Downtime):** Render nastartuje novou instanci. Jakmile nová instance odpoví statusem 200 na endpointu `/health`, provoz se plynule přepne na novou verzi a stará se vypne. Hráči nezaznamenají žádný výpadek.

##  Autorský tým
* Matěj Hodek - Frontend & Design
* Mohammed Wehbe - Backend & Herní logika
* Marian Vystavěl - Návrh databáze & Herní ekonomika
* Tomáš Bureš - Tester
* Stanislav Petr - Projektový manažer
