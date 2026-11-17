import { readFileSync } from "node:fs";
import { join } from "node:path";
import db from "../database/connection.ts";

// Kør: npm run seed-categories
// categories.json er den eneste kilde til taksonomien (se docs/taksonomi.md).
// Kun navnet gemmes i databasen. Keywords læses fra filen af matchingen.
type Category = {
  name: string;
  keywords: string[];
  excludeKeywords: string[];
};

const categories = JSON.parse(
  readFileSync(join(import.meta.dirname, "categories.json"), "utf-8"),
) as Category[];

// INSERT OR IGNORE gør scriptet sikkert at køre flere gange.
// En kategori, der slettes fra filen, bliver ikke slettet i databasen.
const insertCategory = db.prepare("INSERT OR IGNORE INTO category (name) VALUES (?)");

let inserted = 0;
for (const category of categories) {
  inserted += Number(insertCategory.run(category.name).changes);
}

console.log(`${inserted} nye kategorier (${categories.length} i alt i filen)`);
