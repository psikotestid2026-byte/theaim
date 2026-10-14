/**
 * Fails the build when IST or WPT item banks, answer keys, or norms are committed.
 * Catalog rows (name, duration, formula name) are allowed. Key material is not.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "coverage", "out", "dist"]);
const TEXT_EXT = new Set([".json", ".ts", ".tsx", ".js", ".mjs", ".sql", ".md"]);

const FIELD_NEEDLES = ["ge_rw_" + "konversi", "ge_" + "scoring_keys"];

const SENSITIVE_FIELDS = new Set([
  "keys",
  "norms",
  "question_data",
  "iq_categories",
  "sw_categories",
  "accepted",
  "ge_answers",
  "accepted_digits",
  "raw_score",
  "norm_score",
  ...FIELD_NEEDLES,
]);

function isProtectedCode(value: unknown): value is string {
  return value === "ist" || value === "wpt";
}

/** Structured hit: an IST/WPT object that carries items, keys, or norms. */
export function istWptBankViolations(value: unknown, where = "value"): string[] {
  const hits: string[] = [];
  walk(value, where, hits);
  return hits;
}

function walk(value: unknown, where: string, hits: string[]): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${where}[${index}]`, hits));
    return;
  }
  const record = value as Record<string, unknown>;
  const codeRaw = record.code ?? record.test_code;
  const code = typeof codeRaw === "string" ? codeRaw.toLowerCase() : "";
  if (isProtectedCode(code)) {
    const found = Object.keys(record).filter((key) => SENSITIVE_FIELDS.has(key));
    const config = record.config_data;
    if (config && typeof config === "object" && !Array.isArray(config)) {
      for (const key of Object.keys(config as Record<string, unknown>)) {
        if (SENSITIVE_FIELDS.has(key)) found.push(`config_data.${key}`);
      }
    }
    if (found.length > 0 || "order_number" in record) {
      hits.push(`${where} code=${code} ${found.join(", ") || "item row"}`);
    }
  }
  for (const [key, child] of Object.entries(record)) {
    if (isProtectedCode(key)) {
      const nested = JSON.stringify(child);
      if (/"keys"|"norms"|"question_data"|"raw_score"|"norm_score"|"iq_categories"|"sw_categories"|ge_rw_konversi|ge_scoring_keys/.test(nested)) {
        hits.push(`${where}.${key} scoring content`);
      }
    }
    walk(child, `${where}.${key}`, hits);
  }
}

function textViolations(path: string, text: string): string[] {
  const hits: string[] = [];
  for (const needle of FIELD_NEEDLES) {
    if (text.includes(needle)) hits.push(`${path} contains ${needle}`);
  }
  const patterns = [
    /(?:["']code["']|code|["']test_code["']|test_code)\s*:\s*["'](ist|wpt)["']/gi,
    /(?:^|\n)\s*["']?(ist|wpt)["']?\s*:\s*\{/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      const window = text.slice(index, index + 1800);
      if (/(?:["']?(?:keys|norms|question_data|raw_score|norm_score|iq_categories|sw_categories)["']?)\s*:/.test(window)) {
        hits.push(`${path} near offset ${index} has IST/WPT keys or norms`);
      }
      for (const needle of FIELD_NEEDLES) {
        if (window.includes(needle)) hits.push(`${path} near offset ${index} contains ${needle}`);
      }
    }
  }
  return hits;
}

export function scanRepoForIstWptBanks(root: string): string[] {
  const hits: string[] = [];
  walkDir(root, hits);
  return hits;
}

function walkDir(dir: string, hits: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    let info;
    try {
      info = statSync(path);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      walkDir(path, hits);
      continue;
    }
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
    if (!TEXT_EXT.has(ext)) continue;
    if (name === "ist-bank-guard.ts" || name === "ist-bank-guard.test.ts") continue;
    let text: string;
    try {
      text = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    const rel = relative(process.cwd(), path);
    if (ext === ".json") {
      try {
        hits.push(...istWptBankViolations(JSON.parse(text) as unknown, rel));
      } catch {
        hits.push(...textViolations(rel, text));
      }
    }
    hits.push(...textViolations(rel, text));
  }
}
