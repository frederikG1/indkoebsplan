import type { Plan } from "../../../shared/types.ts"

export const examplePlan: Plan = {
    chainIds: [1, 2],
    lines: [
        { itemId: 1, offerId: 10, chainId: 1, priceCents: 3500 },
        { itemId: 2, offerId: 20, chainId: 2, priceCents: 2 * 1000 },
        { itemId: 3, offerId: null, chainId: null, priceCents: null },
    ],
    totalCents: 5500,
    coveredCount: 2,
    savingsCents: 500,
};

export const itemNames: Record<number, string> = { 1: "Kaffe", 2: "Mælk", 3: "Æg"}
export const chainNames: Record<number, string> = { 1: "Netto", 2: "Rema 1000"};