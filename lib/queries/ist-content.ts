import { sql } from "@/lib/db";
import { parseIstMemorizeList, parseIstPublicSubtests, parseIstSchedule, parseIstScoringTables, type IstNormRow } from "@/lib/ist-config";
import type { IstMemorizeList, IstScheduleEntry, IstScoringTables, IstSubtestPublic } from "@/lib/ist-types";

/**
 * Subtest clocks only. The SELECT lists code, name, bounds, and time limits.
 * It does not read instructions, examples, or the memorize word list.
 */
export async function getIstSchedule(): Promise<IstScheduleEntry[] | null> {
  const rows = await sql`
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'code', elem.item->>'code',
        'name', COALESCE(elem.item->>'name', elem.item->>'code'),
        'from', (elem.item->>'from')::int,
        'to', (elem.item->>'to')::int,
        'timeLimitSec', (elem.item->>'timeLimitSec')::int,
        'memorizeSec', NULLIF(elem.item->>'memorizeSec', '')::int
      )
      ORDER BY elem.ord
    ), '[]'::jsonb) AS subtests
    FROM scoring_configs sc
    JOIN master_tests mt ON mt.id = sc.test_id
    CROSS JOIN LATERAL jsonb_array_elements(sc.config_data->'subtests') WITH ORDINALITY AS elem(item, ord)
    WHERE lower(mt.code) = 'ist'
  `;
  const subtests = (rows[0] as { subtests?: unknown } | undefined)?.subtests;
  return parseIstSchedule(subtests);
}

/**
 * Runner payload: instructions, examples, and example figures.
 * The memorize word list is not selected.
 */
export async function getIstPublicSubtests(): Promise<IstSubtestPublic[] | null> {
  const rows = await sql`
    SELECT jsonb_build_object(
      'subtests', COALESCE(jsonb_agg(
        jsonb_build_object(
          'code', elem.item->>'code',
          'name', COALESCE(elem.item->>'name', elem.item->>'code'),
          'from', (elem.item->>'from')::int,
          'to', (elem.item->>'to')::int,
          'timeLimitSec', (elem.item->>'timeLimitSec')::int,
          'memorizeSec', NULLIF(elem.item->>'memorizeSec', '')::int,
          'instructions', COALESCE(elem.item->>'instructions', ''),
          'examples', COALESCE(elem.item->'examples', '[]'::jsonb),
          'exampleImage', elem.item->>'exampleImage'
        )
        ORDER BY elem.ord
      ), '[]'::jsonb)
    ) AS config_data
    FROM scoring_configs sc
    JOIN master_tests mt ON mt.id = sc.test_id
    CROSS JOIN LATERAL jsonb_array_elements(sc.config_data->'subtests') WITH ORDINALITY AS elem(item, ord)
    WHERE lower(mt.code) = 'ist'
  `;
  const config = (rows[0] as { config_data?: unknown } | undefined)?.config_data;
  return config ? parseIstPublicSubtests(config) : null;
}

/** Conversion tables for scoring. Does not select the memorize word list or item keys. */
export async function getIstScoringTables(): Promise<IstScoringTables | null> {
  const [configRows, normRows] = await Promise.all([
    sql`
      SELECT jsonb_build_object(
        'subtests', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'code', elem.item->>'code',
              'name', COALESCE(elem.item->>'name', elem.item->>'code'),
              'from', (elem.item->>'from')::int,
              'to', (elem.item->>'to')::int,
              'timeLimitSec', (elem.item->>'timeLimitSec')::int,
              'memorizeSec', NULLIF(elem.item->>'memorizeSec', '')::int
            )
            ORDER BY elem.ord
          )
          FROM jsonb_array_elements(sc.config_data->'subtests') WITH ORDINALITY AS elem(item, ord)
        ), '[]'::jsonb),
        'ge_raw_to_rw', sc.config_data->'ge_raw_to_rw',
        'iq_categories', sc.config_data->'iq_categories',
        'provisional_items', sc.config_data->'provisional_items'
      ) AS config_data
      FROM scoring_configs sc
      JOIN master_tests mt ON mt.id = sc.test_id
      WHERE lower(mt.code) = 'ist'
      LIMIT 1
    `,
    sql`
      SELECT tn.age_group, tn.raw_score, tn.norm_score, tn.label, tn.description
      FROM test_norms tn
      JOIN master_tests mt ON mt.id = tn.test_id
      WHERE lower(mt.code) = 'ist'
    `,
  ]);
  const config = (configRows[0] as { config_data?: unknown } | undefined)?.config_data;
  if (!config) return null;
  return parseIstScoringTables(config, normRows as IstNormRow[]);
}

/**
 * ME word list. Call this only after the server clock says the session is in the memorize phase.
 */
export async function getIstMemorizeList(): Promise<IstMemorizeList | null> {
  const rows = await sql`
    SELECT elem.item->'memorizeList' AS memorize_list
    FROM scoring_configs sc
    JOIN master_tests mt ON mt.id = sc.test_id
    CROSS JOIN LATERAL jsonb_array_elements(sc.config_data->'subtests') WITH ORDINALITY AS elem(item, ord)
    WHERE lower(mt.code) = 'ist'
      AND upper(elem.item->>'code') = 'ME'
    LIMIT 1
  `;
  const list = (rows[0] as { memorize_list?: unknown } | undefined)?.memorize_list;
  return parseIstMemorizeList(list);
}
