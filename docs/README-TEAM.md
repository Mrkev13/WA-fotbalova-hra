# Pixel Football Tycoon - Týmový Plán

Tento soubor obsahuje rozdělení úkolů a strukturu projektu pro tým.

## Tým a odpovědnosti

| Jméno | Úloha | Body ze zadání | Stav |
| :--- | :--- | :--- | :--- |
| **@chapzz** | UX/UI & Flow | 1 (Wireframy), 2 (User flow) | ⏳ Čeká na start |
| **@Hamudy** | Logika & API | 3 (Herní systémy), 6 (Návrh API) | ⏳ Čeká na start |
| **@THE_GOAT** | Ekonomika & Data | 4 (Ekonomika), 5 (Datový model) | ✅ HOTOVO |
| **@Tomago** | Testing & QA | n/a | ⏳ Čeká na kód |

## Další kroky (Co má kdo dělat)

### 🎨 @chapzz (UX/UI Design)
1. **Wireframy**: Vytvořit vizuální návrhy pro Dashboard, Správu týmu a Zápisovou obrazovku. Uložit do `docs/wireframes/`.
2. **User Flow**: Rozpracovat cestu hráče od registrace až po odehrání zápasu do `docs/user_flow/`.

### ⚙️ @Hamudy (Backend Logic)
1. **Generování hráčů**: Implementovat funkci v `backend/src/services`, která vytvoří 11 náhodných hráčů (podle bodu 3A).
2. **Simulace**: Připravit matematický model pro výpočet gólu a výsledku zápasu (podle bodu 3B).
3. **API**: Začít na implementaci endpointů v `backend/src/api` (vycházet z bodu 6).

### 🛠️ @THE_GOAT (Database & Economy)
- **Hotovo**: Schéma a ekonomika jsou připraveny k integraci. Nyní asistovat @Hamudy při napojování na API.

### 🧪 @Tomago (QA)
- **Test Plan**: Připravit scénáře pro testování simulace zápasu (ověřit, že náhoda funguje správně) a ekonomiky (peníze se správně odečítají a přičítají).

## Struktura složek

- `/docs` - Dokumentace a návrhy (@chapzz)
- `/backend` - Logika serveru, modely a API (@Hamudy, @THE_GOAT)
- `/frontend` - Uživatelské rozhraní (@chapzz)
- `/static` - Statické soubory (obrázky, loga)

---
*Vytvořeno automaticky pro projekt WA-fotbalova-hra.*
