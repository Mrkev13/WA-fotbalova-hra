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

##  Autorský tým
* Matěj Hodek - Frontend & Design
* Mohammed Wehbe - Backend & Herní logika
* Marian Vystavěl - Návrh databáze & Herní ekonomika
* Tomáš Bureš - Tester
* Stanislav Petr - Projektový manažer
