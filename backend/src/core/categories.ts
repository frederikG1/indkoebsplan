import { readFileSync } from "node:fs";
import { join } from "node:path";

// Taksonomien og den simple keyword-matching (baseline). Reglerne står i docs/matching.md.
export type Category = {
  name: string;
  keywords: string[];
  excludeKeywords: string[];
};

export function loadCategories(): Category[] {
  const file = join(import.meta.dirname, "categories.json");
  return JSON.parse(readFileSync(file, "utf-8")) as Category[];
}

// Små bogstaver, alt der ikke er bogstav eller tal bliver til mellemrum,
// og et mellemrum i hver ende, så keywords som " te " kun rammer hele ord.
export function normalize(text: string): string {
  return ` ${text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;
}

// Et tilbud hører til en kategori, hvis overskriften indeholder et af kategoriens
// keywords og ingen af dens excludeKeywords. Hver kategori optræder højst én gang.
export function matchCategories(heading: string, categories: Category[]): string[] {
  const text = normalize(heading);
  return categories
    .filter(
      (c) =>
        c.keywords.some((k) => text.includes(k)) &&
        !c.excludeKeywords.some((k) => text.includes(k)),
    )
    .map((c) => c.name);
}
