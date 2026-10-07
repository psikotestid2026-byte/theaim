import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { BIGFIVE_ITEMS } from "@/lib/scoring/ruangtes/bigfive";
import { msaiBlockForOrder, msaiOptionLabels } from "@/lib/msai-form";
import * as schema from "./schema";

// Approved RuangTes overlap export (Abadi, 7 Oct 2026). Mapped onto test_items.
// Does not load Talents Mapping statements. Does not delete uppercase demo banks
// such as test_code = 'MBTI', which existing sessions still answer.

const EXPECTED_COUNTS: Record<string, number> = {
  mbti: 70,
  disc: 24,
  bigfive: 44,
  enneagram: 180,
  riasec: 108,
  papi: 90,
  wpt: 50,
  ist: 137,
  msdt: 64,
  msai: 87,
};

const LIKERT_LABELS = [
  "Sangat Tidak Setuju",
  "Tidak Setuju",
  "Netral",
  "Setuju",
  "Sangat Setuju",
];

const ALLOWED_CATEGORIES = new Set([
  "PERSONALITY",
  "COGNITIVE",
  "LEADERSHIP",
  "VOKASIONAL",
  "TECHNICAL",
  "GENERAL",
]);

type QuestionBankRow = {
  code: string;
  name: string;
  category: string;
  duration_sec: number;
  instructions: string;
  order_number: number;
  question_type: string;
  question_data: { text?: string; options?: string[] };
};

type ScoringRow = {
  code: string;
  formula_type: string;
  config_data: Record<string, unknown>;
};

type NormRow = {
  code: string;
  raw_score: string | number;
  norm_score: string | number;
  label: string;
  description: string | null;
};

function loadJson<T>(filename: string): T {
  const path = join(process.cwd(), "db/seed-data/overlap", filename);
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function optionRows(labels: string[]) {
  return labels.map((label, index) => ({ value: String(index + 1), label }));
}

function toTestItem(row: QuestionBankRow, testId: number) {
  const data = row.question_data ?? {};
  const rawOptions = Array.isArray(data.options) ? data.options.filter((label) => typeof label === "string") : [];
  let questionText = (data.text ?? "").trim();
  if (!questionText && row.code === "disc") {
    questionText = (row.instructions ?? "").trim();
  }
  if (!questionText) {
    questionText = "Stem soal tidak tersedia pada berkas sumber.";
  }
  const msaiScale = row.code === "msai" ? msaiOptionLabels(row.order_number) : null;
  const labels = msaiScale
    ? msaiScale
    : rawOptions.length > 0
      ? rawOptions
      : row.question_type === "likert_5"
        ? LIKERT_LABELS
        : [];
  if (labels.length === 0) {
    throw new Error(`Overlap item ${row.code} #${row.order_number} has no options`);
  }
  const block = row.code === "msai" ? msaiBlockForOrder(row.order_number) : null;
  const bigFive = row.code === "bigfive" ? BIGFIVE_ITEMS[row.order_number - 1] : undefined;
  return {
    test_code: row.code,
    test_id: testId,
    section: block?.id ?? row.question_type,
    item_order: row.order_number,
    question_text: questionText,
    options: optionRows(labels),
    scoring_meta: {
      question_type: row.question_type,
      source: "ruangtes-overlap",
      ...(block ? { msai_block: block.id } : {}),
      ...(bigFive ? { dimension: bigFive.dimension, reversed: bigFive.reversed } : {}),
    },
  };
}

function distinctNorms(rows: NormRow[]) {
  const seen = new Set<string>();
  const distinct: NormRow[] = [];
  for (const row of rows) {
    const key = JSON.stringify([
      row.code,
      String(row.raw_score),
      String(row.norm_score),
      row.label,
      row.description ?? "",
    ]);
    if (seen.has(key)) continue;
    seen.add(key);
    distinct.push(row);
  }
  return distinct;
}

export async function seedOverlapBanks() {
  const questions = loadJson<QuestionBankRow[]>("question_banks.json");
  const scoring = loadJson<ScoringRow[]>("scoring_configs.json");
  const norms = loadJson<NormRow[]>("test_norms.json");
  const codes = Object.keys(EXPECTED_COUNTS);

  const counts = new Map<string, number>();
  for (const row of questions) {
    counts.set(row.code, (counts.get(row.code) ?? 0) + 1);
  }
  for (const code of codes) {
    if (counts.get(code) !== EXPECTED_COUNTS[code]) {
      throw new Error(`Overlap bank ${code} has ${counts.get(code) ?? 0} items, expected ${EXPECTED_COUNTS[code]}`);
    }
  }
  const extraCodes = [...counts.keys()].filter((code) => !(code in EXPECTED_COUNTS));
  if (extraCodes.length > 0) {
    throw new Error(`Overlap bank has unexpected codes: ${extraCodes.join(", ")}`);
  }

  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const db = drizzle(sql, { schema });

  const tests = await db.select({
    id: schema.masterTests.id,
    code: schema.masterTests.code,
  }).from(schema.masterTests);
  const idByCode = new Map(tests.map((test) => [test.code, test.id]));
  for (const code of codes) {
    if (!idByCode.has(code)) throw new Error(`master_tests is missing ${code}`);
  }

  const blocked = await sql`
    SELECT ti.test_code, count(*)::int AS n
    FROM test_items ti
    WHERE ti.test_code = ANY(${codes})
      AND EXISTS (SELECT 1 FROM test_responses tr WHERE tr.item_id = ti.id)
    GROUP BY ti.test_code
  `;
  if (blocked.length > 0) {
    throw new Error(`Refusing to replace answered overlap items: ${JSON.stringify(blocked)}`);
  }

  await sql`DELETE FROM test_items WHERE test_code = ANY(${codes})`;

  const metaByCode = new Map<string, QuestionBankRow>();
  const items = [];
  for (const row of questions) {
    if (!metaByCode.has(row.code)) metaByCode.set(row.code, row);
    const testId = idByCode.get(row.code);
    if (!testId) throw new Error(`missing test id ${row.code}`);
    items.push(toTestItem(row, testId));
  }

  const batchSize = 80;
  for (let offset = 0; offset < items.length; offset += batchSize) {
    await db.insert(schema.testItems).values(items.slice(offset, offset + batchSize));
  }

  for (const code of codes) {
    const meta = metaByCode.get(code);
    if (!meta) throw new Error(`missing metadata ${code}`);
    if (!ALLOWED_CATEGORIES.has(meta.category)) {
      throw new Error(`Unexpected category ${meta.category} for ${code}`);
    }
    const testId = idByCode.get(code);
    if (!testId) throw new Error(`missing test id ${code}`);
    await db.update(schema.masterTests).set({
      name: meta.name,
      category: meta.category,
      instructions: meta.instructions,
      duration_sec: meta.duration_sec,
      total_questions: EXPECTED_COUNTS[code],
      updated_at: new Date(),
    }).where(eq(schema.masterTests.id, testId));
  }

  const scoringByCode = new Map(scoring.map((row) => [row.code, row]));
  for (const code of codes) {
    const row = scoringByCode.get(code);
    if (!row) throw new Error(`missing scoring config ${code}`);
    const testId = idByCode.get(code);
    if (!testId) throw new Error(`missing test id ${code}`);
    await db.insert(schema.scoringConfigs).values({
      test_id: testId,
      formula_type: row.formula_type,
      config_data: row.config_data,
    }).onConflictDoUpdate({
      target: schema.scoringConfigs.test_id,
      set: {
        formula_type: row.formula_type,
        config_data: row.config_data,
      },
    });
  }

  const distinct = distinctNorms(norms);
  const normTestIds = [...new Set(distinct.map((row) => idByCode.get(row.code)).filter((id): id is number => !!id))];
  await sql`DELETE FROM test_norms WHERE test_id = ANY(${normTestIds})`;
  const normValues = distinct.map((row) => {
    const testId = idByCode.get(row.code);
    if (!testId) throw new Error(`norm row for unknown code ${row.code}`);
    return {
      test_id: testId,
      age_group: null,
      raw_score: String(row.raw_score),
      norm_score: String(row.norm_score),
      label: row.label,
      description: row.description,
    };
  });
  for (let offset = 0; offset < normValues.length; offset += batchSize) {
    await db.insert(schema.testNorms).values(normValues.slice(offset, offset + batchSize));
  }

  const itemCounts = await sql`
    SELECT test_code, count(*)::int AS n
    FROM test_items
    WHERE test_code = ANY(${codes})
    GROUP BY test_code
    ORDER BY test_code
  `;
  const legacy = await sql`
    SELECT test_code, count(*)::int AS n
    FROM test_items
    WHERE test_code <> ALL(${codes})
    GROUP BY test_code
    ORDER BY test_code
  `;
  const formulaRows = await sql`
    SELECT mt.code, sc.formula_type
    FROM scoring_configs sc
    JOIN master_tests mt ON mt.id = sc.test_id
    ORDER BY mt.code
  `;
  const normCounts = await sql`
    SELECT mt.code, count(*)::int AS n
    FROM test_norms tn
    JOIN master_tests mt ON mt.id = tn.test_id
    GROUP BY mt.code
    ORDER BY mt.code
  `;
  const sessions = await sql`
    SELECT status, count(*)::int AS n FROM test_sessions GROUP BY status ORDER BY status
  `;

  console.log("Overlap bank seed:");
  console.log(JSON.stringify({
    items: itemCounts,
    legacy_items_kept: legacy,
    formulas: formulaRows,
    norms_stored: normCounts,
    norms_source_rows: norms.length,
    norms_distinct_rows: distinct.length,
    sessions,
  }, null, 2));
}
