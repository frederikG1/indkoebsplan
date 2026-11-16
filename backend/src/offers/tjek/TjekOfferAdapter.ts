import type { Offer } from "../types.ts";
import type { TjekOffer } from "./tjekTypes.ts";

// Oversætter Tjek-format til vores Offer. Den virker for alle kæder,
// fordi Tjek leverer samme format for Netto, Føtex, Rema osv.
export function toOffers(tjekOffers: TjekOffer[]): Offer[] {
  return tjekOffers.map((o) => ({
    chainName: o.dealer.name,
    chainDescription: o.dealer.description,
    productName: o.heading,
    // "24 x 33 cl" bliver til 792 cl. Ved intervaller som "300-400 g" bruges den mindste.
    quantity: o.quantity.size.from * o.quantity.pieces.from,
    unit: o.quantity.unit?.symbol ?? null,
    priceCents: toCents(o.pricing.price),
    beforePriceCents: o.pricing.pre_price === null ? null : toCents(o.pricing.pre_price),
    validFrom: new Date(o.run_from).toISOString(),
    validTo: new Date(o.run_till).toISOString(),
  }));
}

// Tjek sender kroner som decimaltal (fx 21.950000000000003), vi gemmer hele øre.
function toCents(kroner: number): number {
  return Math.round(kroner * 100);
}
