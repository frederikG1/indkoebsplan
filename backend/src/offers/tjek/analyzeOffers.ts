import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { TjekOffer } from "./tjekTypes.ts";

// Måler datakvaliteten i Tjek-fixtures og udskriver en tabel pr. kæde.
// GTIN og mærke findes ikke som felter hos Tjek, så de er ikke med.
// Kør: npm run analyze-offers

// Hver måling er et navn og en regel, der svarer ja/nej for ét tilbud.
const checks: [string, (o: TjekOffer) => boolean][] = [
  ['Flere varer ("eller")', (o) => / eller /i.test(o.heading)],
  ["Mængde som interval", (o) => o.quantity.size.from !== o.quantity.size.to],
  ["Mængde ukendt (1 stk.)", (o) => o.quantity.unit?.symbol === "pcs" && o.quantity.size.from === 1],
  ["Førpris", (o) => o.pricing.pre_price !== null],
  ["Medlemspris", (o) => /medlem|gælder kun med/i.test(o.description ?? "")],
  ["Tjek-kategori", (o) => o.category_ids.length > 0],
];

const fixturesDir = join(import.meta.dirname, "fixtures");
const rows: string[] = [];
const totals = checks.map(() => 0);
let totalOffers = 0;

for (const file of readdirSync(fixturesDir).filter((f) => f.endsWith(".json"))) {
  const offers = JSON.parse(readFileSync(join(fixturesDir, file), "utf-8")) as TjekOffer[];
  const counts = checks.map(([, rule]) => offers.filter(rule).length);
  counts.forEach((c, i) => (totals[i] += c));
  totalOffers += offers.length;
  rows.push(row(file.replace(".json", ""), offers.length, counts));
}

const table = [
  `| Kæde | Tilbud | ${checks.map(([name]) => name).join(" | ")} |`,
  `|---|---|${checks.map(() => "---").join("|")}|`,
  ...rows,
  row("**I alt**", totalOffers, totals),
].join("\n");

console.log(table);

function row(name: string, offerCount: number, counts: number[]): string {
  return `| ${name} | ${offerCount} | ${counts.map((c) => pct(c, offerCount)).join(" | ")} |`;
}

function pct(count: number, of: number): string {
  return `${Math.round((count / of) * 100)} %`;
}
