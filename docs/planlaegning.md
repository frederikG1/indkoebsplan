# Planlægning: antagelser

Reglerne for, hvordan en indkøbsliste bliver til planer for 1–3 butikker. Planlægningskoden (S3) og rapporten bygger på dem. Tallene er målt på de 800 tilbud fra Tjek, uge 47 (se docs/matching.md).

## 1. Medlemspriser

**Beslutning:** Tilbudsprisen (`pricing.price`) bruges uændret. Medlems- og app-priser ignoreres.

**Hvorfor:** 14 af 800 tilbud (1,75 %) har en medlemspris. I 13 af dem er `pricing.price` prisen *uden* medlemskab, og medlemsprisen står kun i beskrivelsesteksten (fx "+ PRIS 20 … Gælder kun med Netto+ appen"). Brugeren betaler derfor aldrig mere end den viste pris. At finde medlemsprisen ville kræve tekstparsing og et ekstra felt, som næsten aldrig bruges (YAGNI).

**Begrænsning:** Planen kan i få tilfælde vise en pris, der er lidt højere end det, et medlem betaler.

## 2. Multikøb og mængder

**Beslutning:** Multikøb ("3 stk. for 85 kr.", markeret "v/merkøb") indgår ikke i planerne. Multipakker (fx 24 x 33 cl) er én vare. Prisen for en vare på listen er tilbudsprisen gange antallet på listen. Mængde (gram, liter) og mængdeintervaller bruges ikke i planlægningen.

**Hvorfor:** Kun 5 af 800 tilbud er multikøb (Bilka og føtex). En omregnet stykpris er ikke det, brugeren betaler, hvis de kun skal bruge én (KISS). Over halvdelen af tilbuddene har en mængde som interval ("500-875 g") eller ukendt mængde, så sammenligning pr. kg ville være upålidelig.

## 3. Afstand og butikker

**Beslutning:**
- Brugeren vælger en maks. afstand (radius fra sin placering, standard 5 km) og et maks. antal butikker (1–3, standard 2).
- Alle tilbud gælder hele kæden. For hver kæde bruges den nærmeste butik inden for radius.
- Afstand er luftlinje (haversine). Der bruges ikke vejnet.
- Ruten er tur-retur fra placeringen gennem planens butikker i den korteste rækkefølge. Med højst 3 butikker er der højst 6 rækkefølger, som alle prøves.
- Ligger der ingen butik inden for radius, får brugeren besked om at øge afstanden i stedet for en tom plan.

**Hvorfor:** Brugeren afvejer selv pris mod besvær (user story 3). Appen afgør det ikke med en fast regel som "maks. X km pr. ekstra butik". Luftlinje er nok til at sammenligne planer indbyrdes og kræver ingen ekstern tjeneste.

**Begrænsning:** Km er "ca., i luftlinje". Den nærmeste butik pr. kæde giver ikke altid den kortest mulige rute. Radius gælder hver butik, ikke hele ruten.

## 4. Sammenligning af planer

**Beslutning:**
- For hver vare på listen og hver kæde vælges det billigste gyldige tilbud i varens kategori. Har brugeren et mærkekrav ("kaffe, kun Merrild"), skal mærket stå i tilbuddets overskrift. Ellers indgår tilbuddet ikke, og der er ingen fallback til et andet mærke.
- Et tilbud med flere varer ("chips eller nødder") kan dække flere varer på listen, og prisen gælder hver af dem.
- En vare er "uden pris" i en plan, hvis ingen af planens kæder har et tilbud på den.
- Planer sorteres først efter antal dækkede varer og derefter efter samlet pris. Hver plan viser "dækker X af Y varer".
- **Referenceplanen** er den billigste plan med én butik (flest dækkede varer først).
- **Besparelse** = referenceplanens pris minus planens pris for de varer, begge planer dækker.
- **Ekstra km** = planens rute minus referenceplanens rute. Den kan være negativ.
- En kombination, hvor en af kæderne ikke er billigst på nogen vare, droppes. Den er bare en mindre plan med en overflødig butik.
- Ved samme pris i to kæder vælges kæden med laveste id, så planerne altid bliver de samme.
- Besparelsen kan være negativ, hvis planen er dyrere end referencen på de fælles varer. Den vises, som den er.

**Hvorfor:** Uden en regel for dækning vil den billigste plan altid være den, der dækker færrest varer. Når besparelse og km måles mod den samme reference, kan brugeren se, hvad en ekstra butik koster og giver. Førpriser kan ikke bruges, fordi kun 2 % af tilbuddene har en.

**Begrænsning:** Gælder et "eller"-tilbud i praksis kun ét af valgene, overvurderes besparelsen.

## 5. Gyldighed

**Beslutning:** Planen laves til en indkøbsdato (standard i dag), og kun tilbud med `valid_from ≤ dato ≤ valid_to` indgår.

**Hvorfor:** Kæderne har forskellige gyldighedsperioder (20 forskellige i uge 47), så "ugens tilbud" er ikke ét fast sæt. Nogle tilbud er udløbet, og andre er endnu ikke startet.

## Konsekvenser for S3

- Ét tilbud kan høre til flere kategorier. Datamodellen skal derfor kunne koble tilbud og kategorier mange-til-mange (i dag har et produkt kun én kategori).
- Standardværdierne (5 km, 2 butikker) står som konstanter i koden.
