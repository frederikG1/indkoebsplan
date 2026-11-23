import { MAX_STOPS } from "./distance.ts";

// Beregner planer for 1–3 kæder ud fra listepunkter med matchede tilbud.
// Reglerne står i docs/planlaegning.md, afsnit 4.

export type PlanOffer = {
  offerId: number;
  chainId: number;
  priceCents: number;
};

// Et listepunkt med de tilbud, der passer til det. Kalderen har allerede
// matchet tilbuddene og filtreret på mærkekrav og gyldighedsdato.
export type PlanItem = {
  itemId: number;
  name: string;
  quantity: number;
  offers: PlanOffer[];
};

// Én vare i en plan. Er alle tre felter null, er varen "uden pris" i planen.
export type PlanLine = {
  itemId: number;
  offerId: number | null;
  chainId: number | null;
  priceCents: number | null; // tilbudspris × antal på listen
};

export type Plan = {
  chainIds: number[];
  lines: PlanLine[];
  totalCents: number;
  coveredCount: number;
  savingsCents: number; // i forhold til referenceplanen; kan være negativ
};

export const DEFAULT_MAX_STORES = 2;

// Alle måder at vælge `size` elementer på, fx ([1, 2, 3], 2) → [[1, 2], [1, 3], [2, 3]].
function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  // Vælg hvert element som det første, og kombinér det med elementerne efter det.
  return items.flatMap((item, i) =>
    combinations(items.slice(i + 1), size - 1).map((rest) => [item, ...rest]),
  );
}

// Det billigste tilbud på varen blandt kombinationens kæder.
// Ved samme pris vinder laveste kæde-id, så resultatet altid er det samme.
function cheapestLine(item: PlanItem, chainIds: number[]): PlanLine {
  let best: PlanOffer | null = null;
  for (const offer of item.offers) {
    if (!chainIds.includes(offer.chainId)) continue;
    const cheaper = best === null || offer.priceCents < best.priceCents;
    const sameButLowerId =
      best !== null && offer.priceCents === best.priceCents && offer.chainId < best.chainId;
    if (cheaper || sameButLowerId) best = offer;
  }

  if (best === null) {
    return { itemId: item.itemId, offerId: null, chainId: null, priceCents: null };
  }
  return {
    itemId: item.itemId,
    offerId: best.offerId,
    chainId: best.chainId,
    priceCents: best.priceCents * item.quantity,
  };
}

// Flest dækkede varer først, så laveste pris, så færrest butikker, så laveste kæde-id'er.
function comparePlans(a: Plan, b: Plan): number {
  if (a.coveredCount !== b.coveredCount) return b.coveredCount - a.coveredCount;
  if (a.totalCents !== b.totalCents) return a.totalCents - b.totalCents;
  if (a.chainIds.length !== b.chainIds.length) return a.chainIds.length - b.chainIds.length;
  for (let i = 0; i < a.chainIds.length; i++) {
    if (a.chainIds[i] !== b.chainIds[i]) return a.chainIds[i] - b.chainIds[i];
  }
  return 0;
}

// `chainIds` er kun de kæder, der har en butik inden for brugerens radius.
export function buildPlans(
  items: PlanItem[],
  chainIds: number[],
  maxStores = DEFAULT_MAX_STORES,
): Plan[] {
  if (maxStores < 1 || maxStores > MAX_STOPS) {
    throw new Error(`maxStores skal være mellem 1 og ${MAX_STOPS}, fik ${maxStores}`);
  }
  if (items.length === 0 || chainIds.length === 0) return [];

  const sortedChains = [...chainIds].sort((a, b) => a - b);
  const plans: Plan[] = [];

  for (let size = 1; size <= Math.min(maxStores, sortedChains.length); size++) {
    for (const combo of combinations(sortedChains, size)) {
      const lines = items.map((item) => cheapestLine(item, combo));

      // Drop planen, hvis en af kæderne ikke bruges til nogen vare. Så er den
      // bare en mindre plan med en overflødig butik.
      const usedChains = new Set(lines.map((line) => line.chainId));
      if (!combo.every((chainId) => usedChains.has(chainId))) continue;

      const covered = lines.filter((line) => line.priceCents !== null);
      plans.push({
        chainIds: combo,
        lines,
        totalCents: covered.reduce((sum, line) => sum + (line.priceCents ?? 0), 0),
        coveredCount: covered.length,
        savingsCents: 0, // sættes nedenfor, når referenceplanen kendes
      });
    }
  }

  plans.sort(comparePlans);

  // Referenceplanen er den bedste plan med én butik. Findes der ingen
  // (ingen kæde dækker nogen vare), er der ingen planer at sammenligne.
  const reference = plans.find((plan) => plan.chainIds.length === 1);
  if (!reference) return plans;

  // Besparelse = referencens pris minus planens pris for de varer, begge planer dækker.
  // Linjerne står i samme rækkefølge som `items`, så index i passer i begge planer.
  for (const plan of plans) {
    let savings = 0;
    plan.lines.forEach((line, i) => {
      const refPrice = reference.lines[i].priceCents;
      if (line.priceCents !== null && refPrice !== null) {
        savings += refPrice - line.priceCents;
      }
    });
    plan.savingsCents = savings;
  }

  return plans;
}
