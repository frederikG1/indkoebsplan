# Matching: taksonomi og testsæt

## Taksonomi

Taksonomien er den faste liste over varer (kategorier), som både indkøbslisten og tilbuddene kobles til. Den ligger i `backend/src/categories/categories.json` og seedes med `npm run seed-categories`.

### Regler

1. **En kategori er det, en bruger skriver på sin indkøbsliste.** Fx "kaffe" og ikke "BKI formalet kaffe 400 g".
2. **Mærke og variant er egenskaber, ikke kategorier.** "Merrild kaffe" er kategorien kaffe med mærket Merrild (user story 2).
3. **To varer er samme kategori, når brugeren ville tage den ene i stedet for den anden.** Hakket oksekød og hakket svinekød er derfor to kategorier. Det samme gælder kyllingebrystfilet og hel kylling.
4. **Kategorierne vælges ud fra en typisk ugeindkøbsliste, ikke ud fra ugens tilbudsavis.** Basisvarer som mælk og rugbrød kommer med, selvom de sjældent er på tilbud. Sæsonvarer (jul) kommer ikke med.
5. **Omfang nu: mad, drikkevarer uden alkohol og de mest almindelige husholdnings- og hygiejnevarer** (fx toiletpapir, vaskemiddel, tandpasta, bleer). Alkohol, tøj, legetøj og elektronik er udeladt. Taksonomien kan udvides senere ved at tilføje flere linjer i filen, uden at koden ændres.

### Keywords

- Hver kategori har `keywords`: et tilbud matcher, hvis overskriften indeholder et af dem (uden forskel på store og små bogstaver).
- `excludeKeywords` er ord, der udelukker et match, fx "mælkechokolade" for mælk.
- Overskriften normaliseres før match: små bogstaver, alt der ikke er et bogstav eller et tal (fx bindestreg, komma og %) erstattes af mellemrum, og der sættes et mellemrum i hver ende. Keywords skrives derfor uden tegn ("led pærer", ikke "led-pærer").
- Matcheren ligger i `backend/src/categories/categories.ts` (`matchCategories`).
- Korte keywords ("te", "æg", "ris") rammer ofte inde i andre ord ("entrecote", "pålæg", "gris"). De skrives derfor med mellemrum omkring (`" te "`), så de kun matcher som hele ord. Lange keywords står uden mellemrum, så de også fanger sammensatte ord ("kyllingebrystfilet").
- Mærker bruges kun som keyword, når mærket kun laver én slags vare (fx "Lavazza"). Mærker som Cheasy og Arla laver mange varer og bruges derfor ikke.

## Testsæt

Testsættet er facit for matchingen: tilbud, hvor det rigtige svar (kategorierne) er angivet på forhånd. Evalueringsscriptet sammenligner matcherens svar med facit og måler precision og recall. Filen er `backend/src/evaluation/testset.tsv`.

### Mærkningsregler

Reglerne er skrevet, før mærkningen begyndte, og er ikke ændret undervejs.

1. **Kun overskriften tæller.** Matcheren læser kun overskriften, så facit gør det også. Beskrivelsen og billedet bruges ikke.
2. **Kategorien skal kunne ses i overskriften.** En person med almindeligt dansk kendskab til dagligvarer skal kunne se varetypen ud fra overskriften alene. Et mærke alene tæller kun, når mærket i praksis er én vare (fx "Coca-Cola", "Philadelphia"). "Schulstad brød" og "Familien Jacobsen pålæg" er derfor `ingen`, fordi typen ikke fremgår.
3. **Mærke, variant og pakning er ligegyldige.** Økologisk, fedtprocent, størrelse, XXL og multipak ændrer ikke kategorien. "Thise økologisk jerseymælk" er Mælk.
4. **Alle nævnte varer tæller.** Et tilbud med flere varer ("A, B eller C") får hver af de kategorier, varerne hører til. Varer uden kategori ignoreres.
5. **Kun varer, der kan erstatte kategorien.** Følger taksonomiens regel 3: varen tæller kun, hvis en bruger, der har skrevet kategorien på sin liste, ville tage den i stedet. Tilberedte, panerede, marinerede eller smagsatte varer er derfor `ingen` (flødekartofler, kaffekapsler, kakaomælk, pålægssalat). Undtagelsen er varer, der normalt kun sælges sådan, fx marinerede sild.
6. **Ved tvivl: `ingen` og en note.**

### Format

- Tabulator-separeret med kolonnerne `id` (Tjeks tilbuds-id), `chain`, `heading`, `categories` og `note`.
- `categories` er kategorinavne præcis som i `categories.json`, adskilt med `;`, fx `Pølser;Bacon`. `ingen` står altid alene.

### Afgjorte eksempler

| Overskrift | Facit | Regel |
|---|---|---|
| Merrild eller Lavazza formalet kaffe | Kaffe | 3 |
| Thise økologisk jerseymælk | Mælk | 3 |
| Coca-Cola* | Sodavand | 2 |
| Schulstad brød | ingen | 2 |
| 3-Stjernet pålæg | ingen | 2 |
| Hakket okse- eller grise/kalvekød | Hakket oksekød;Hakket svinekød | 4 |
| Steff Houlberg pålæg eller leverpostej | Leverpostej | 4 |
| Taffel chips eller nødder | Chips | 4 |
| Carletti skum, chokopålæg, finsk lakrids eller Evers bolsjer | Slik;Pålægschokolade | 4 |
| Burger Boost original, smoky twist eller hakket oksekød 8-12% | Hakket oksekød | 4 |
| Kærgården økologisk smørbar eller Arla ØKO økologisk smør | Smør | 4, 5 |
| Thise økologisk græsk yoghurt eller aktiv drikkeyoghurt | Yoghurt | 4, 5 |
| Peka brunede kartofler eller flødekartofler | ingen | 5 |
| Cirkel Kaffe, Starbucks, Nescafe … eller Lavazza kaffekapsler | ingen | 5 |
| Matilde kakao skummetmælk | ingen | 5 |
| Panerede rejer eller rødspættefileter | ingen | 5 |
| Coop marineret lammeculotte, tykstegsbøffer, bbq koteletter … | ingen | 5 |
| Marinerede sild | Sild | 5 (undtagelse) |
| Marabou slikmarked | Slik | 2 |
| Pukka økologisk te julekalender | ingen | 5 |

### Datagrundlag

- **Kilde:** fixtures fra Tjek, hentet 16. nov. 2026. Det er de første 100 tilbud fra hver af de 8 kæders ugeavis, gyldige ca. 12.–21. nov. Tilbuddene er spredt over hele avisen og ikke kun de første sider.
- **Udtræk:** de 800 tilbud blev blandet tilfældigt (fast seed), og de første 50 unikke overskrifter pr. kæde blev taget. Det giver 400 tilbud. Ved ens overskrift i flere kæder (fx Kvickly og SuperBrugsen) er det tilfældigt, hvilken kæde tilbuddet står under.
- **Mærkning:** udført af en sprogmodel (Claude Sonnet) efter reglerne ovenfor, uden adgang til matcheren.
- **Kontrol:** en anden model (Claude Opus) gennemgik en tilfældig stikprøve på 40 rækker og var enig i 37. Uenighederne pegede på uensartede afgørelser, som derefter blev rettet i hele filen. Det gav 8 rettede rækker, som er markeret med en note:
  - Skæreoste som gouda, cheddar og vesterhavsost er Skiveost, ligesom "skæreost".
  - Klementiner er Appelsiner.
  - Energidrik (fx Faxe Kondi Booster, Red Bull) er `ingen`.
  - Chokoladebarer er Chokolade.
  - "Easis crunch" er ikke is.
- **Resultat:** 400 tilbud. 234 er `ingen`, 166 har mindst én kategori, og 14 har flere kategorier.

### Kendte begrænsninger

- Taksonomiens keywords er skrevet med de samme tilbud for øje. Tallene herfra er derfor lidt optimistiske. En senere uge kan bruges som holdout.
- Facit er lavet af en sprogmodel og ikke af et menneske.
- Med 86 kategorier får de fleste kategorier kun få eksempler. Hovedtallet er derfor samlet precision og recall over alle tilbud.
- Ugen er præget af jul, hvilket giver mange `ingen`.

## Evaluering

`npm run evaluate` (i backend) kører matcheren på testsættet og sammenligner med facit. Scriptet er `backend/src/evaluation/evaluate.ts`, og det giver samme tal hver gang på samme data.

### Definitioner

- **Enheden er et (tilbud, kategori)-par.** Facit for et tilbud er mængden af kategorier i testsættet (tom ved `ingen`). Matcherens svar er mængden af kategorier, den finder.
- **TP** (sand positiv): parret står både i facit og i svaret. **FP** (falsk positiv): kun i svaret. **FN** (falsk negativ): kun i facit.
- **Precision** = TP / (TP + FP): hvor stor en del af matcherens svar der er rigtige.
- **Recall** = TP / (TP + FN): hvor stor en del af facit matcheren finder.
- Tallene er samlet over alle par (micro). Tilbud med flere varer vægter derfor tungere end tilbud med én.
- **Falske alarmer:** antal `ingen`-tilbud, hvor matcheren alligevel svarer noget. Det er den fejl, en bruger ser som et forkert tilbud.
- Precision og recall pr. kategori vises kun for kategorier med mindst 5 facit-eksempler. Ved færre er tallet for usikkert.
- Output indeholder dato og commit. Er taksonomien eller testsættet ændret uden commit, står det ved commit'en.

### Resultater

**Runde 1: baseline** (2026-11-17, keyword-matching som beskrevet ovenfor). Målt på udviklingssættet, som keywords er skrevet ud fra, så tallene er optimistiske.

| Mål | Værdi |
|---|---|
| Precision | 91,2 % |
| Recall | 86,1 % |
| TP / FP / FN | 155 / 15 / 25 |
| Falske alarmer på `ingen`-tilbud | 11 af 234 |

De største svagheder er Slik (recall 2 af 14) og Chokolade (1 af 5), hvor varetypen ofte kun står som et mærke eller produktnavn ("Juleskum", "Guld barre"), samt marinerede varer ("brystfilet med lage"), som matcheren ikke kan skelne fra rå varer.
