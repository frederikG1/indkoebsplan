import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import db from "../database/connection.ts";
import type { Offer } from "./types.ts";
import type { TjekOffer } from "./tjek/tjekTypes.ts";
import { toOffers } from "./tjek/TjekOfferAdapter.ts";

// Kør: npm run import-offers [sti/til/tjek.json]
// Uden argument importeres alle fixtures (hentet med npm run fetch-offers).
const fixturesDir = join(import.meta.dirname, "tjek", "fixtures");
const files = process.argv[2]
  ? [process.argv[2]]
  : readdirSync(fixturesDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => join(fixturesDir, f));

const tjekOffers = files.flatMap(
  (file) => JSON.parse(readFileSync(file, "utf-8")) as TjekOffer[],
);

saveOffers(toOffers(tjekOffers));

// En import er et øjebliksbillede af kædens tilbudsavis: kædens gamle tilbud
// erstattes, så importen kan køres flere gange uden dubletter.
function saveOffers(offers: Offer[]) {
  const insertChain = db.prepare("INSERT OR IGNORE INTO chain (name, description) VALUES (?, ?)");
  const findChain = db.prepare("SELECT id FROM chain WHERE name = ?");
  const deleteChainOffers = db.prepare("DELETE FROM offer WHERE chain_id = ?");
  const findProduct = db.prepare(
    "SELECT id FROM product WHERE name = ? AND quantity IS ? AND unit IS ?",
  );
  const insertProduct = db.prepare(
    "INSERT INTO product (name, quantity, unit) VALUES (?, ?, ?)",
  );
  const insertOffer = db.prepare(
    `INSERT INTO offer (chain_id, product_id, price_cents, before_price_cents, valid_from, valid_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const clearedChains = new Set<number>();

  db.exec("BEGIN");
  try {
    for (const offer of offers) {
      insertChain.run(offer.chainName, offer.chainDescription);
      const chain = findChain.get(offer.chainName) as { id: number };

      if (!clearedChains.has(chain.id)) {
        deleteChainOffers.run(chain.id);
        clearedChains.add(chain.id);
      }

      let product = findProduct.get(offer.productName, offer.quantity, offer.unit) as
        | { id: number }
        | undefined;
      if (!product) {
        const result = insertProduct.run(offer.productName, offer.quantity, offer.unit);
        product = { id: Number(result.lastInsertRowid) };
      }

      insertOffer.run(
        chain.id,
        product.id,
        offer.priceCents,
        offer.beforePriceCents,
        offer.validFrom,
        offer.validTo,
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(`Importerede ${offers.length} tilbud`);
}
