import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlans, type PlanItem } from "./plans.ts";

const NETTO = 1;
const REMA = 2;
const LIDL = 3;

// Håndregnet eksempel (priser i øre):
//   mælk × 2: Netto 700, REMA 800    kaffe × 1: Netto 4000, Lidl 3500    smør × 1: REMA 2000
// Planer (dækning, pris):
//   REMA+Lidl  3 varer: 1600 + 3500 + 2000 = 7100
//   Netto+REMA 3 varer: 1400 + 4000 + 2000 = 7400
//   REMA       2 varer: 1600 + 2000        = 3600   ← reference (bedste med én butik)
//   Netto+Lidl 2 varer: 1400 + 3500        = 4900   (smør uden pris)
//   Netto      2 varer: 1400 + 4000        = 5400
//   Lidl       1 vare:  3500
// Besparelse for Netto+REMA: mælk 1600 − 1400 = 200, smør 2000 − 2000 = 0 → 200.
test("buildPlans vælger billigste tilbud, sorterer og beregner besparelse", () => {
  const items: PlanItem[] = [
    { itemId: 1, name: "mælk", quantity: 2, offers: [
      { offerId: 10, chainId: NETTO, priceCents: 700 },
      { offerId: 11, chainId: REMA, priceCents: 800 },
    ] },
    { itemId: 2, name: "kaffe", quantity: 1, offers: [
      { offerId: 20, chainId: NETTO, priceCents: 4000 },
      { offerId: 21, chainId: LIDL, priceCents: 3500 },
    ] },
    { itemId: 3, name: "smør", quantity: 1, offers: [
      { offerId: 30, chainId: REMA, priceCents: 2000 },
    ] },
  ];

  const plans = buildPlans(items, [NETTO, REMA, LIDL], 2);

  assert.deepEqual(plans.map((p) => p.chainIds), [
    [REMA, LIDL], [NETTO, REMA], [REMA], [NETTO, LIDL], [NETTO], [LIDL],
  ]);
  assert.deepEqual(plans.map((p) => p.totalCents), [7100, 7400, 3600, 4900, 5400, 3500]);
  assert.equal(plans[1].savingsCents, 200);
  assert.equal(plans[3].lines[2].priceCents, null); // smør er uden pris hos Netto+Lidl
});

// REMA er dyrere end Netto på alt, så Netto+REMA ville bare være Netto med en ekstra butik.
test("buildPlans dropper kombinationer med en overflødig butik", () => {
  const items: PlanItem[] = [
    { itemId: 1, name: "mælk", quantity: 1, offers: [
      { offerId: 10, chainId: NETTO, priceCents: 700 },
      { offerId: 11, chainId: REMA, priceCents: 800 },
    ] },
  ];

  const plans = buildPlans(items, [NETTO, REMA], 2);

  assert.deepEqual(plans.map((p) => p.chainIds), [[NETTO], [REMA]]);
});
