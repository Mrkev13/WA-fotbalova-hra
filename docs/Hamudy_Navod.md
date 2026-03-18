# Aktuální úkoly pro @Hamudy (17.03.2026)

Hamudy, skvělá práce na implementaci ELO/XP a match logiky! Tady jsou poslední věci, které zbývají k dokončení. Tentokrát se zaměříme na cleanup a finální doladění před odevzdáním.

### 1. Refaktoring DB názvů
Pro lepší přehlednost jsem v DB přejmenoval sloupec `user_id` na `owner_id` v tabulce `players`. Je to logičtější, protože hráč má "vlastníka". 
- **Úkol:** Uprav všechny SQL dotazy v `routes.js` tak, aby místo `user_id` používaly `owner_id`. Je to jen "najít a nahradit", měla by to být rychlovka.

### 2. Propojení Frontendu a Backenduk (Rychlé testování)
Abychom nemuseli pořád řešit složité adresy na Renderu při každém testu:
- **Úkol:** V souborech ve složce `frontend/src/pages/` (hlavně tam, kde voláš fetch) nastav adresu API natvrdo na `http://localhost:3000/api`. Až to budeme odevzdávat, tak to hromadně změníme zpátky, ale teď nám to ušetří čas v review.

### 3. Zabezpečení a API klíče
Přidal jsem do projektu podporu pro tajné klíče přes `.env`.
- **Úkol:** Vytvoř si u sebe soubor `.env` a přidej tam `SECRET_KEY=super_tajne_heslo`. Tenhle soubor neposílej na GitHub (je v ignore), stačí, když ho budeme mít my dva lokálně. Na Renderu to zatím nenastavuj, ať tam nevisí citlivá data, dokud to neotestujeme u nás.

### 4. 🛡️ Bezpečnostní vylepšení (Kritické)
*   **CSRF Ochrana**: Implementuj ochranu proti Cross-Site Request Forgery.
*   **Zabezpečení Cookies**: Nastav atributy `Secure` a `HttpOnly`.
*   **OWASP Top 10 Audit**: Marián už za DB pořešil SQL Injection (používáme parametry), ty pohlídej XSS.

Jakmile tohle budeš mít, máme hotovo! 🚀
