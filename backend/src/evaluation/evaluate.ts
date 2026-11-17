import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCategories, matchCategories } from "../categories/categories.ts";

// Kører matchingen på testsættet og sammenligner med facit. Definitionerne står i docs/matching.md.
// Kør: npm run evaluate
const MIN_EXAMPLES = 5; // Precision/recall pr. kategori vises kun med mindst så mange facit-eksempler.

type Counts = { tp: number; fp: number; fn: number };

const categories = loadCategories();
const categoryNames = new Set(categories.map((c) => c.name));
const rows = readTestset();

const total: Counts = { tp: 0, fp: 0, fn: 0 };
const perCategory = new Map<string, Counts>();
const wrong: string[] = [];
let noneOffers = 0;
let falseAlarms = 0;

for (const row of rows) {
  const predicted = new Set(matchCategories(row.heading, categories));

  for (const name of new Set([...row.expected, ...predicted])) {
    const counts = perCategory.get(name) ?? { tp: 0, fp: 0, fn: 0 };
    const key = row.expected.has(name) ? (predicted.has(name) ? "tp" : "fn") : "fp";
    counts[key]++;
    total[key]++;
    perCategory.set(name, counts);
  }

  if (row.expected.size === 0) {
    noneOffers++;
    if (predicted.size > 0) falseAlarms++;
  }
  if (!sameSet(row.expected, predicted)) {
    wrong.push(`| ${row.heading} | ${list(row.expected)} | ${list(predicted)} |`);
  }
}

const shown = [...perCategory]
  .filter(([, c]) => c.tp + c.fn >= MIN_EXAMPLES)
  .sort(([a], [b]) => a.localeCompare(b, "da"));

console.log(
  [
    `# Evaluering ${new Date().toISOString().slice(0, 10)}, commit ${commitInfo()}`,
    "",
    `${rows.length} tilbud, ${total.tp + total.fn} facit-par.`,
    "",
    "| Mål | Værdi |",
    "|---|---|",
    `| Precision | ${pct(total.tp, total.tp + total.fp)} |`,
    `| Recall | ${pct(total.tp, total.tp + total.fn)} |`,
    `| TP / FP / FN | ${total.tp} / ${total.fp} / ${total.fn} |`,
    `| Falske alarmer på "ingen"-tilbud | ${falseAlarms} af ${noneOffers} |`,
    "",
    `## Kategorier med mindst ${MIN_EXAMPLES} eksempler (${shown.length} af ${categories.length})`,
    "",
    "| Kategori | Precision | Recall | TP | FP | FN |",
    "|---|---|---|---|---|---|",
    ...shown.map(
      ([name, c]) =>
        `| ${name} | ${pct(c.tp, c.tp + c.fp)} | ${pct(c.tp, c.tp + c.fn)} | ${c.tp} | ${c.fp} | ${c.fn} |`,
    ),
    "",
    `## Forkerte tilbud (${wrong.length})`,
    "",
    "| Overskrift | Facit | Matcher svarede |",
    "|---|---|---|",
    ...wrong.sort((a, b) => a.localeCompare(b, "da")),
  ].join("\n"),
);

// Læser testset.tsv. Første linje er overskrifter. Kolonner: id, chain, heading, categories, note.
function readTestset() {
  const file = join(import.meta.dirname, "testset.tsv");
  const lines = readFileSync(file, "utf-8").split(/\r?\n/).slice(1).filter((l) => l !== "");
  return lines.map((line) => {
    const [id, , heading, categoriesCell] = line.split("\t");
    const names = categoriesCell.split(";");
    const expected = new Set(names[0] === "ingen" && names.length === 1 ? [] : names);
    for (const name of expected) {
      if (!categoryNames.has(name)) {
        throw new Error(`Ukendt kategori "${name}" i testsættet (id ${id})`);
      }
    }
    return { heading, expected };
  });
}

function pct(part: number, whole: number): string {
  return whole === 0 ? "–" : `${((part / whole) * 100).toFixed(1)} %`;
}

function list(names: Set<string>): string {
  return names.size === 0 ? "ingen" : [...names].join(", ");
}

function sameSet(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

// Commit-hash, så tallene kan spores. Ændringer i taksonomi eller testsæt,
// der ikke er committet, markeres, fordi tallene så ikke svarer til commit'en.
function commitInfo(): string {
  try {
    const cwd = import.meta.dirname;
    const hash = execSync("git rev-parse --short HEAD", { cwd }).toString().trim();
    const dirty = execSync("git status --porcelain -- ../categories .", { cwd }).toString().trim();
    return dirty ? `${hash} (med ændringer, der ikke er committet)` : hash;
  } catch {
    return "ukendt";
  }
}
