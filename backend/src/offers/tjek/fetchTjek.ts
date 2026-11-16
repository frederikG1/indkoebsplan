import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Henter hver kædes aktuelle ugeavis fra Tjek og gemmer tilbuddene som fixtures.
// Kør: npm run fetch-offers
const API = "https://squid-api.tjek.com/v2";
const MAX_OFFERS = 100; // Tjek giver højst 100 pr. kald

// Dealer-id'er fra GET /dealers?country_id=DK
const CHAINS: Record<string, string> = {
  netto: "9ba51",
  foetex: "bdf5A",
  bilka: "93f13",
  superbrugsen: "0b1e8",
  kvickly: "c1edq",
  "365discount": "DWZE1w",
  lidl: "71c90",
  rema1000: "11deC",
};

type TjekCatalog = {
  id: string;
  label: string;
  offer_count: number;
  run_from: string;
  run_till: string;
};

const fixturesDir = join(import.meta.dirname, "fixtures");
mkdirSync(fixturesDir, { recursive: true });

for (const [slug, dealerId] of Object.entries(CHAINS)) {
  const catalogs = await getJson<TjekCatalog[]>(`/catalogs?dealer_ids=${dealerId}&limit=100`);
  const catalog = pickWeeklyCatalog(catalogs);
  if (!catalog) {
    console.warn(`${slug}: ingen ugeavis fundet, springes over`);
    continue;
  }

  const offers = await getJson<Record<string, unknown>[]>(
    `/offers?catalog_ids=${catalog.id}&limit=${MAX_OFFERS}`,
  );
  // Billeder og branding fylder det meste af filen og bruges ikke.
  const slim = offers.map(({ images, branding, ...rest }) => rest);

  writeFileSync(join(fixturesDir, `${slug}.json`), JSON.stringify(slim, null, 2));
  console.log(`${slug}: ${slim.length} af ${catalog.offer_count} tilbud fra "${catalog.label}"`);
}

// En kæde har flere aviser samtidig (nonfood, legetøj, skønhed ...).
// Ugeavisen er den kortvarige med flest tilbud, som ikke er nonfood.
function pickWeeklyCatalog(catalogs: TjekCatalog[]): TjekCatalog | undefined {
  const maxDays = 14;
  return catalogs
    .filter((c) => days(c.run_from, c.run_till) <= maxDays)
    .filter((c) => !/nonfood/i.test(c.label))
    .sort((a, b) => b.offer_count - a.offer_count)[0];
}

function days(from: string, to: string): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`Tjek svarede ${res.status} på ${path}`);
  return (await res.json()) as T;
}
