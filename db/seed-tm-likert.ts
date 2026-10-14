import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { TM_LIKERT_ITEMS } from "./seed-data/tm-likert-items";

// Upsert the TheAIM-authored 170 Likert stems by (test_code, item_order).
// Existing rows are updated in place. Missing rows are inserted. Nothing is deleted.

const TEST_CODE = "talents_mapping";

function assertBank() {
  if (TM_LIKERT_ITEMS.length !== 170) {
    throw new Error(`TM Likert bank has ${TM_LIKERT_ITEMS.length} items, expected 170`);
  }
  const orders = new Set<number>();
  const perTheme = new Map<string, number>();
  for (const item of TM_LIKERT_ITEMS) {
    if (orders.has(item.item_order)) {
      throw new Error(`Duplicate TM item_order ${item.item_order}`);
    }
    orders.add(item.item_order);
    const theme = String(item.scoring_meta.theme_code ?? "");
    if (!theme) throw new Error(`TM item ${item.item_order} has no theme_code`);
    perTheme.set(theme, (perTheme.get(theme) ?? 0) + 1);
    if (item.options.length !== 5) {
      throw new Error(`TM item ${item.item_order} does not have 5 Likert options`);
    }
  }
  for (let order = 1; order <= 170; order += 1) {
    if (!orders.has(order)) throw new Error(`TM bank is missing item_order ${order}`);
  }
  if (perTheme.size !== 34) {
    throw new Error(`TM bank covers ${perTheme.size} themes, expected 34`);
  }
  for (const [theme, count] of perTheme) {
    if (count !== 5) throw new Error(`Theme ${theme} has ${count} statements, expected 5`);
  }
}

export async function seedTmLikertItems() {
  assertBank();
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const db = drizzle(sql, { schema });
  const tests = await db.select({ id: schema.masterTests.id })
    .from(schema.masterTests)
    .where(eq(schema.masterTests.code, TEST_CODE))
    .limit(1);
  const testId = tests[0]?.id;
  if (!testId) throw new Error("master_tests is missing talents_mapping");

  const payload = JSON.stringify(TM_LIKERT_ITEMS.map((item) => ({
    section: item.section,
    item_order: item.item_order,
    question_text: item.question_text,
    options: item.options,
    scoring_meta: item.scoring_meta,
  })));

  const result = await sql`
    WITH incoming AS (
      SELECT *
      FROM jsonb_to_recordset(${payload}::jsonb) AS x(
        section text,
        item_order int,
        question_text text,
        options jsonb,
        scoring_meta jsonb
      )
    ),
    updated AS (
      UPDATE test_items AS ti
      SET section = incoming.section,
          question_text = incoming.question_text,
          options = incoming.options,
          scoring_meta = incoming.scoring_meta,
          test_id = ${testId},
          updated_at = now()
      FROM incoming
      WHERE ti.test_code = ${TEST_CODE}
        AND ti.item_order = incoming.item_order
      RETURNING ti.id
    ),
    inserted AS (
      INSERT INTO test_items (test_code, test_id, section, item_order, question_text, options, scoring_meta)
      SELECT ${TEST_CODE}, ${testId}, incoming.section, incoming.item_order,
             incoming.question_text, incoming.options, incoming.scoring_meta
      FROM incoming
      WHERE NOT EXISTS (
        SELECT 1
        FROM test_items AS ti
        WHERE ti.test_code = ${TEST_CODE}
          AND ti.item_order = incoming.item_order
      )
      RETURNING id
    )
    SELECT
      (SELECT count(*)::int FROM updated) AS updated,
      (SELECT count(*)::int FROM inserted) AS inserted
  `;

  const summary = await sql`
    SELECT
      count(*)::int AS items,
      count(DISTINCT item_order)::int AS distinct_orders,
      count(DISTINCT scoring_meta->>'theme_code')::int AS themes,
      min(id)::int AS min_id,
      max(id)::int AS max_id,
      min(test_id)::int AS test_id
    FROM test_items
    WHERE test_code = ${TEST_CODE}
  `;

  console.log("TM Likert seed:");
  console.log(JSON.stringify({
    test_id: testId,
    write: result[0],
    stored: summary[0],
  }, null, 2));
}
