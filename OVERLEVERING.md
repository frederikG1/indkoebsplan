# Overlevering: Indkøbsplan (hovedopgave)

Status pr. 10. november 2026. Dækker sessionen "TypeScript conversion issues (fork)" fra 9. november.

**Sådan bruges filen:** Klon repoet på den anden computer, læg denne fil i roden, åbn en ny Claude-session i mappen, og skriv:

> Læs OVERLEVERING.md og fortsæt derfra, hvor vi slap. Opret også CLAUDE.local.md og hukommelsen ud fra afsnittet "Personlig opsætning".

## Projektet

Solo-hovedopgave på EK (tidligere KEA), startet 9. november 2026 og planlagt til ni uger. Produktet omsætter en indkøbsliste til en plan for, hvad man skal købe hvor, fordelt på 1-3 butikker.

Rapporten må højst være 40 normalsider, og sidefordelingen bruger allerede alle 40. Vejlederen skal godkende problemformuleringen tidligt.

| Hvad | Hvor |
| --- | --- |
| Kode | https://github.com/frederikG1/indkoebsplan (offentligt repo) |
| Projektplan og tjekliste | https://claude.ai/artifact/U6ghTPQdusnDVAHLaosFR8 |
| Trello-board | https://trello.com/b/XerdjJMK/hovedopgave-fra-indk |
| Backlog (kort) | https://trello.com/c/uXMES4lM/9-s1-backlog-med-user-stories-og-acceptkriterier-moscow |
| Datamodel (kort) | https://trello.com/c/kNUJsKlP/10-s1-datamodel-i-sqlite |
| Definition of Done (kort) | https://trello.com/c/rOPiM2YF/72-definition-of-done |
| Logbog (kort) | https://trello.com/c/gaCAyiAS/71-logbog |
| Problemformulering (Word på Drive) | https://docs.google.com/document/d/13eXThbyJ46MsXcJEjJiy6VKKQjVRmiia/edit |
| Tidligere planlægningssamtale | https://claude.ai/share/f046cec7-fd7a-41d7-b5c1-01fdaa2d6470 |

Planen og Trello skal holdes i sync. Fremskridt krydses af begge steder.

## Hvor vi slap

Sprint 1 er i gang.

**Færdigt:**
- Studieordningen er tjekket.
- Repo med `backend`, `frontend` og `shared` er sat op og committet.
- Definition of Done og logbog er oprettet på Trello.
- Backlog med ti user stories er skrevet på backlog-kortet.

**Næste skridt:**
1. Læs backloggen igennem og flyt kortet til Done, hvis du er enig. Kortet lå i Ready ved sidste tjek.
2. Lav datamodellen i SQLite med migrationer og seed-script inkl. dummy-bruger.
3. Byg adapteren til 6-8 kæder, som også står i sprint 1.

**Tabeller i datamodellen:** chain, store, offer, product, category, price, list, list_item og user. Alt koderelateret skrives på engelsk.

```
user: id, email (unik), password_hash, created_at
list: ..., user_id → user.id
```

**Løse ender i problemformuleringen:**
- Der blev lavet en Word-kopi med login-linjen under "Med" i afgrænsningen, men det er ikke bekræftet, at den er uploadet til Drive.
- Sætningen "Servicen udvikles som en webapplikation med en React-frontend, en Node.js-backend og en SQLite-database" mangler et punktum.
- Datoen øverst står som 4. november, mens filnavnet siger 9. november.

## Beslutninger

| Beslutning | Begrundelse |
| --- | --- |
| TypeScript i begge ender | Frontend og backend kan dele typer. Kan vælges fra igen, hvis det bliver for besværligt. |
| Fælles typer i `shared/types.ts`, importeret med `import type` og relativ sti | Kræver ingen ekstra pakker eller opsætning. |
| Typerne bruges først ved første rigtige endpoint | De sættes der, hvor data forlader backend, og hvor frontend modtager dem. |
| Backend-skelet bliver i sprint 3 | Det handler om lagene adapter, kerne og API plus domænemodeller og DTO'er. Det er noget andet end projektopsætningen, og sprint 1 er allerede fuld. |
| Definition of Done og logbog ligger på Trello, ikke i repoet | Det er der, arbejdet foregår hver dag. |
| Logbogen holdes kort | Én linje pr. punkt: lavet, beslutning, problem, næste. Kun den vigtigste beslutning. Det første udkast var for langt. |
| Login er med | Viser authentication i Node.js. Must med seedet dummy-bruger, kontooprettelse er Should. |
| Brugertabel i sprint 1, selve login i sprint 5 | Tager ikke tid fra adapteren nu. |

## Backlog i kort form

Den fulde tekst med acceptkriterier står på backlog-kortet på Trello.

- **Must:** (1) Skriv faste varer én gang. (2) Krav som "kaffe, kun Merrild". (3) Se billigste planer for 1-3 butikker med pris, besparelse og ekstra km. (4) Sæt antal butikker og maks. afstand. (5) Brug placering eller vælg punkt. (6) Log ind, så listen er min egen.
- **Should:** (7) Opret konto. (8) Brug på mobil. (9) Skift datakilde uden at ændre kernen.
- **Could:** (10) Skift mellem uger.
- **Won't:** Native app, geofencing i baggrunden og betaling.

## Teknisk status

**Kommandoer:**
- Backend: `npm run dev`, `npm start` og `npm run typecheck`. Typetjekket dækker kun `backend/src`.
- Frontend: `npm run build` laver også typetjek. `npm run lint` kører lint.

**Sådan ser koden ud nu:**
- Backend er Express i `backend/src/app.ts` og sender kun "Hello World".
- Frontend er ryddet helt og viser kun overskriften "Indkøbsplan".
- `shared/types.ts` indeholder kun `ListItem` og bruges ikke endnu.
- Frontend er ikke åbnet i en browser, og frontend og backend er ikke forbundet endnu.

**Plan for login:**
- Brug `express-session` med en `httpOnly`-cookie og `express-rate-limit` på login-ruten.
- Giv samme fejlbesked, uanset om e-mail eller adgangskode er forkert.
- Filtrér altid på den indloggede brugers id i databasen.
- Læg aldrig `password_hash` i typerne i `shared`.
- Dummy-brugerens adgangskode og `SESSION_SECRET` skal stå i `.env`.
- Brug helst en proxy i Vite, så frontend og backend kører på samme adresse under udvikling. Så er `cors` ikke nødvendig der, og cookies bliver enklere.

**Værd at vide:**
- `npm audit` melder moderate sårbarheder i frontend, men kun i ESLint under udvikling. Undgå `npm audit fix --force`, som ville nedgradere ESLint.
- Frontend bruger TypeScript 6 og backend TypeScript 7. Hold øje med det, når de fælles typer tages i brug.

## Opsætning på den anden computer

```bash
git clone https://github.com/frederikG1/indkoebsplan.git
```

```bash
cd indkoebsplan/backend && npm install
```

```bash
cd ../frontend && npm install
```

Opret derefter `backend/.env` ud fra `backend/.env.example`. `.env`-filen ligger ikke i Git.

Tjek også, at Claude på den anden computer er forbundet til Trello og Google Drive. Ellers kan den ikke læse kortene og problemformuleringen.

## Personlig opsætning

Disse ting ligger kun lokalt og følger ikke med Git.

### CLAUDE.local.md

Opret filen i projektets rod med teksten herunder, og tilføj `CLAUDE.local.md` til `.git/info/exclude`.

```markdown
# Rolle & Mindset
Du er min hybride **Senior Software Architect** og **Product Owner (PO)** på dette fullstack-projekt. Din opgave er både at sikre høj teknisk kvalitet og holde fokus på brugerværdi og fremdrift.

## Din opførsel og ansvarsområder
1. **Som Product Owner (PO):**
   - Udfordr mine ideer: Spørg om formålet (*hvorfor*), før vi beslutter løsningen (*hvordan*).
   - Beskær scope: Hjælp mig med at bygge en stærk MVP uden overflødige funktioner.
   - Prioriter UX, forretningslogik og god brugeroplevelse i alle valg.

2. **Som Senior Software Architect / Lead Developer:**
   - Skriv ren, vedligeholdelsesvenlig, skalérbar og type-sikker kode.
   - Tænk sikkerhed, fejlhåndtering, edge cases og performance ind fra start.
   - Vælg enkle, velprøvede mønstre frem for over-engineered arkitektur.

## Interaktionsmodel
- **Svar-struktur:** Start med en kort produkt-/pragmatisk vurdering (1-3 linjer), før du leverer den tekniske løsning eller koden.
- **Ved nye features:** 
  1. Bekræft/afklar kravene kort.
  2. Skitser datamodellen eller arkitekturen.
  3. Skriv den konkrete kode i velstrukturerede bidder.
- **Konstruktive modspil:** Hvis min foreslåede tilgang skaber teknisk gæld eller er for kompleks, skal du sige det direkte og foreslå et simplere alternativ.
```

### Hukommelse

Gem disse to punkter i Claudes hukommelse:

- **Om brugeren:** Har bygget flere Node-projekter i almindelig JavaScript og kender Java og C#, men har lidt erfaring med TypeScript. Skal kunne forklare koden til eksamen, så TypeScript holdes enkelt: domænetyper og API-typer, ingen smarte generics og ingen `any`. Skriver på dansk.
- **Om projektet:** Koden indgår i eksamen, så stakken og rapporten skal passe sammen. Tjek, at afsnittet om teknologi og punktet om fælles typer stemmer overens med den stak, der faktisk bruges. Fremskridt følges både på Trello og i planen, som skal holdes i sync.
