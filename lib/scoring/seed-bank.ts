/** Test helper: reads the item rows embedded in db/seeds/testbank/*.sql. Not used at runtime. */
import { readFileSync } from "node:fs";
import type { TestItem } from "@/types/db";

type SeedRow = { item_order: number; section: string; question_text: string; options: TestItem["options"]; scoring_meta: object };

export function seedRows(file: string): SeedRow[] {
  const sql = readFileSync(new URL(`../../db/seeds/testbank/${file}`, import.meta.url), "utf8");
  const match = sql.match(/jsonb_to_recordset\('((?:[^']|'')*)'::jsonb\)/);
  if (!match) throw new Error(`no item payload in ${file}`);
  return JSON.parse(match[1].replace(/''/g, "'")) as SeedRow[];
}

export function seedItems(file: string, testCode: string): TestItem[] {
  return seedRows(file).map((row) => ({
    id: row.item_order,
    test_code: testCode,
    section: row.section,
    item_order: row.item_order,
    question_text: row.question_text,
    options: row.options,
    scoring_meta: row.scoring_meta,
    created_at: "",
    updated_at: "",
  }));
}
