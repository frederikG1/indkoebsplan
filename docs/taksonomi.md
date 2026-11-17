# Taksonomi: regler

Taksonomien er den faste liste over varer (kategorier), som både indkøbslisten og tilbuddene kobles til. Den ligger i `backend/src/categories/categories.json`.

## Regler

1. **En kategori er det, en bruger skriver på sin indkøbsliste.** Fx "kaffe" og ikke "BKI formalet kaffe 400 g".
2. **Mærke og variant er egenskaber, ikke kategorier.** "Merrild kaffe" er kategorien kaffe med mærket Merrild (user story 2).
3. **To varer er samme kategori, når brugeren ville tage den ene i stedet for den anden.** Hakket oksekød og hakket svinekød er derfor to kategorier. Det samme gælder kyllingebrystfilet og hel kylling.
4. **Kategorierne vælges ud fra en typisk ugeindkøbsliste, ikke ud fra ugens tilbudsavis.** Basisvarer som mælk og rugbrød kommer med, selvom de sjældent er på tilbud. Sæsonvarer (jul) kommer ikke med.
5. **Omfang nu: mad, drikkevarer uden alkohol og de mest almindelige husholdnings- og hygiejnevarer** (fx toiletpapir, vaskemiddel, tandpasta, bleer). Alkohol, tøj, legetøj og elektronik er udeladt. Taksonomien kan udvides senere ved at tilføje flere linjer i filen, uden at koden ændres.

## Keywords

- Hver kategori har `keywords`: et tilbud matcher, hvis overskriften indeholder et af dem (uden forskel på store og små bogstaver).
- `excludeKeywords` er ord, der udelukker et match, fx "mælkechokolade" for mælk.
- Overskriften normaliseres før match: små bogstaver, tegn og punktummer erstattes af mellemrum, og der sættes et mellemrum i hver ende.
- Korte keywords ("te", "æg", "ris") rammer ofte inde i andre ord ("entrecote", "pålæg", "gris"). De skrives derfor med mellemrum omkring (`" te "`), så de kun matcher som hele ord. Lange keywords står uden mellemrum, så de også fanger sammensatte ord ("kyllingebrystfilet").
- Mærker bruges kun som keyword, når mærket kun laver én slags vare (fx "Lavazza"). Mærker som Cheasy og Arla laver mange varer og bruges derfor ikke.

## Kendte begrænsninger

- Keywords er skrevet med de samme tilbud for øje, som testsættet senere trækkes fra. Tallene for baseline kan derfor se lidt for gode ud. Det håndteres med holdout-testsættet fra en nyere uge (S3).
- Ét tilbud kan dække flere varer ("hakket oksekød eller hel kylling"). Hvordan det håndteres, afgøres i mærkningsreglerne til testsættet.
