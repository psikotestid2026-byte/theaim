import { sql } from "@/lib/db";
import { asId } from "@/lib/ids";
import { IST_SECTION_GRACE_MS } from "@/lib/ist-flow";
import { IST_SUBTEST_CODES } from "@/lib/ist-types";
import { sectionStartsFrom } from "@/lib/queries/test-sessions";
import { DISC_ANSWER_PATTERN } from "@/lib/scoring/disc-answer";
import { TYPED_ANSWER_MAX } from "@/lib/scoring/item-meta";
import { ANSWER_GRACE_MS, TIMED_TEST_SECONDS } from "@/lib/test-timer";
import type { TestItem, TestResponse } from "@/types/db";

export type AnswerWriteContext = {
  sessionId: number;
  testCode: string;
  status: string;
  starts: Record<string, number>;
  nowMs: number;
  timerStartedAt: string | null;
  serverNow: string;
  item: TestItem | null;
};

/**
 * Session clock and the item, in one round trip. `item` is null when the id
 * is not part of this session's test.
 */
export async function loadAnswerWriteContext(token: string, sessionId: number, itemId: number): Promise<AnswerWriteContext | null> {
  const rows = await sql`
    SELECT s.id AS session_id, s.test_code, s.status, s.section_started_at, s.timer_started_at,
           now() AS server_now,
           (extract(epoch from clock_timestamp()) * 1000)::bigint AS server_now_ms,
           ti.id AS item_id, ti.section, ti.item_order, ti.options, ti.scoring_meta
    FROM test_sessions s
    LEFT JOIN test_items ti
      ON ti.id = ${asId(itemId)}
     AND ti.test_code = s.test_code
    WHERE s.access_token = ${token}
      AND s.id = ${asId(sessionId)}
    LIMIT 1
  `;
  const row = rows[0] as
    | {
        session_id: unknown;
        test_code: string;
        status: string;
        section_started_at?: unknown;
        timer_started_at?: unknown;
        server_now: unknown;
        server_now_ms: unknown;
        item_id?: unknown;
        section?: string | null;
        item_order?: unknown;
        options?: unknown;
        scoring_meta?: unknown;
      }
    | undefined;
  if (!row) return null;
  const nowMs = Number(row.server_now_ms);
  const serverNow = row.server_now instanceof Date ? row.server_now.toISOString() : String(row.server_now ?? "");
  const timerStartedAt =
    row.timer_started_at instanceof Date
      ? row.timer_started_at.toISOString()
      : typeof row.timer_started_at === "string"
        ? row.timer_started_at
        : null;
  const item =
    row.item_id == null
      ? null
      : ({
          id: asId(row.item_id as number),
          test_code: row.test_code,
          section: row.section ?? null,
          item_order: Number(row.item_order),
          question_text: "",
          options: (row.options ?? []) as TestItem["options"],
          scoring_meta: (row.scoring_meta ?? null) as TestItem["scoring_meta"],
          created_at: "",
          updated_at: "",
        } satisfies TestItem);
  return {
    sessionId: asId(row.session_id as number),
    testCode: row.test_code,
    status: row.status,
    starts: sectionStartsFrom(row.section_started_at),
    nowMs: Number.isFinite(nowMs) ? nowMs : Number.NaN,
    timerStartedAt,
    serverNow,
    item,
  };
}

/** Upsert one answer (called on every question submit) */
export async function upsertResponse(input: {
  session_id: number;
  item_id: number;
  answer_value: string;
}): Promise<TestResponse> {
  const sessionId = asId(input.session_id);
  const itemId = asId(input.item_id);
  const rows = await sql`
    INSERT INTO test_responses (session_id, item_id, answer_value, answered_at)
    VALUES (${sessionId}, ${itemId}, ${input.answer_value}, now())
    ON CONFLICT (session_id, item_id) DO UPDATE
      SET answer_value = ${input.answer_value}, answered_at = now()
    RETURNING *
  `;
  return rows[0] as TestResponse;
}

export type SaveAnswerReason = "not_found" | "not_confirmed" | "invalid_answer" | "section_closed" | "expired" | "ok";

/**
 * Check the session, the item, and the clock, then upsert, in one statement.
 * The insert runs only for an in-progress session with an allowed answer inside
 * an open window. A completed session is not updated and no answer row is written.
 * A timed test with no clock yet starts that clock in the same statement; a null
 * clock is not treated as expired.
 */
export async function saveAnswerOnce(input: {
  token: string;
  sessionId: number;
  itemId: number;
  answerValue: string;
}): Promise<SaveAnswerReason> {
  const istCodes = IST_SUBTEST_CODES.join(",");
  const timedMs = JSON.stringify(
    Object.fromEntries(Object.entries(TIMED_TEST_SECONDS).map(([code, sec]) => [code, sec * 1000])),
  );
  const rows = await sql`
    WITH sess AS (
      SELECT s.id, s.test_code, s.status,
             COALESCE(s.section_started_at, '{}'::jsonb) AS section_started_at,
             s.timer_started_at,
             (extract(epoch from clock_timestamp()) * 1000)::bigint AS now_ms
      FROM test_sessions s
      WHERE s.access_token = ${input.token}
        AND s.id = ${asId(input.sessionId)}
    ),
    bank AS (
      SELECT ti.id, ti.section, ti.options, ti.scoring_meta
      FROM test_items ti
      JOIN sess s ON ti.test_code = s.test_code AND ti.id = ${asId(input.itemId)}
    ),
    sched AS (
      SELECT raw.ord, raw.code, raw.memorize_sec, raw.time_limit_sec
      FROM (
        SELECT elem.ord::int AS ord,
               upper(btrim(elem.item->>'code')) AS code,
               CASE
                 WHEN coalesce(elem.item->>'memorizeSec', '') ~ '^[0-9]+$' THEN (elem.item->>'memorizeSec')::int
                 ELSE 0
               END AS memorize_sec,
               CASE
                 WHEN coalesce(elem.item->>'timeLimitSec', '') ~ '^[0-9]+$' THEN (elem.item->>'timeLimitSec')::int
                 ELSE NULL
               END AS time_limit_sec
        FROM scoring_configs sc
        JOIN master_tests mt ON mt.id = sc.test_id
        CROSS JOIN LATERAL jsonb_array_elements(sc.config_data->'subtests') WITH ORDINALITY AS elem(item, ord)
        WHERE lower(mt.code) = 'ist'
          AND EXISTS (SELECT 1 FROM sess WHERE lower(test_code) = 'ist')
          AND upper(btrim(elem.item->>'code')) = ANY (string_to_array(${istCodes}, ','))
      ) raw
      WHERE raw.time_limit_sec IS NOT NULL AND raw.time_limit_sec > 0
    ),
    limits AS (
      SELECT CASE
        WHEN (${timedMs}::jsonb ->> lower((SELECT test_code FROM sess))) ~ '^[0-9]+$'
        THEN (${timedMs}::jsonb ->> lower((SELECT test_code FROM sess)))::numeric
        ELSE NULL
      END AS duration_ms
    ),
    disc AS (
      SELECT regexp_match(${input.answerValue}, ${DISC_ANSWER_PATTERN}) AS matched
    ),
    answer_ok AS (
      SELECT CASE
        WHEN NOT EXISTS (SELECT 1 FROM bank) THEN false
        WHEN coalesce((SELECT scoring_meta->>'answer_type' FROM bank), '') IN ('text', 'number') THEN
          length(btrim(${input.answerValue})) BETWEEN 1 AND ${TYPED_ANSWER_MAX}
          AND (
            coalesce((SELECT scoring_meta->>'answer_type' FROM bank), '') <> 'number'
            OR btrim(${input.answerValue}) ~ '^[0-9]{1,6}$'
          )
        WHEN lower((SELECT test_code FROM sess)) = 'disc'
          OR lower(coalesce((SELECT section FROM bank), '')) = 'disc' THEN
          CASE
            WHEN (SELECT matched FROM disc) IS NULL THEN false
            WHEN jsonb_typeof((SELECT options FROM bank)) IS DISTINCT FROM 'array' THEN false
            WHEN (SELECT matched[1] FROM disc) !~ '^[0-9]{1,6}$' THEN false
            WHEN (SELECT matched[2] FROM disc) !~ '^[0-9]{1,6}$' THEN false
            WHEN (SELECT matched[1] FROM disc) = (SELECT matched[2] FROM disc) THEN false
            WHEN (SELECT matched[1] FROM disc)::int >= jsonb_array_length((SELECT options FROM bank)) THEN false
            WHEN (SELECT matched[2] FROM disc)::int >= jsonb_array_length((SELECT options FROM bank)) THEN false
            ELSE true
          END
        ELSE CASE
          WHEN jsonb_typeof((SELECT options FROM bank)) IS DISTINCT FROM 'array' THEN false
          ELSE EXISTS (
            SELECT 1
            FROM jsonb_array_elements((SELECT options FROM bank)) AS opt
            WHERE opt->>'value' = ${input.answerValue}
          )
        END
      END AS ok
    ),
    gate AS (
      SELECT CASE
        WHEN NOT EXISTS (SELECT 1 FROM sess) THEN 'not_found'
        WHEN (SELECT status FROM sess) IS DISTINCT FROM 'in_progress' THEN 'not_confirmed'
        WHEN NOT COALESCE((SELECT ok FROM answer_ok), false) THEN 'invalid_answer'
        WHEN lower((SELECT test_code FROM sess)) = 'ist' AND NOT EXISTS (
          SELECT 1
          FROM sched sch
          WHERE sch.code = upper(btrim(coalesce(
                  nullif((SELECT scoring_meta->>'subtest' FROM bank), ''),
                  (SELECT section FROM bank),
                  ''
                )))
            AND (SELECT section_started_at FROM sess) ? sch.code
            AND sch.ord = (
              SELECT max(s2.ord) FROM sched s2
              WHERE (SELECT section_started_at FROM sess) ? s2.code
            )
            AND (SELECT now_ms FROM sess) >= CASE
                  WHEN ((SELECT section_started_at FROM sess)->>sch.code) ~ '^[0-9]+$'
                  THEN ((SELECT section_started_at FROM sess)->>sch.code)::numeric
                  ELSE NULL
                END + sch.memorize_sec * 1000
            AND (SELECT now_ms FROM sess) <= CASE
                  WHEN ((SELECT section_started_at FROM sess)->>sch.code) ~ '^[0-9]+$'
                  THEN ((SELECT section_started_at FROM sess)->>sch.code)::numeric
                  ELSE NULL
                END + (sch.memorize_sec + sch.time_limit_sec) * 1000 + ${IST_SECTION_GRACE_MS}
        ) THEN 'section_closed'
        WHEN (SELECT duration_ms FROM limits) IS NOT NULL
          AND (SELECT timer_started_at FROM sess) IS NOT NULL
          AND (SELECT now_ms FROM sess) >
              (extract(epoch from (SELECT timer_started_at FROM sess)) * 1000)
              + (SELECT duration_ms FROM limits)
              + ${ANSWER_GRACE_MS}
        THEN 'expired'
        ELSE 'ok'
      END AS reason
    ),
    tick AS (
      UPDATE test_sessions
      SET timer_started_at = COALESCE(timer_started_at, now()),
          updated_at = CASE WHEN timer_started_at IS NULL THEN now() ELSE updated_at END
      WHERE id = (SELECT id FROM sess)
        AND status = 'in_progress'
        AND timer_started_at IS NULL
        AND (SELECT duration_ms FROM limits) IS NOT NULL
        AND (SELECT reason FROM gate) = 'ok'
      RETURNING id
    ),
    saved AS (
      INSERT INTO test_responses (session_id, item_id, answer_value, answered_at)
      SELECT s.id, b.id, ${input.answerValue}, now()
      FROM sess s
      JOIN bank b ON true
      WHERE (SELECT reason FROM gate) = 'ok'
      ON CONFLICT (session_id, item_id) DO UPDATE
        SET answer_value = EXCLUDED.answer_value,
            answered_at = now()
      RETURNING id
    )
    SELECT
      (SELECT reason FROM gate) AS reason,
      (SELECT id FROM saved) AS saved_id,
      (SELECT id FROM tick) AS ticked
  `;
  const reason = (rows[0] as { reason?: unknown } | undefined)?.reason;
  if (
    reason === "not_found" ||
    reason === "not_confirmed" ||
    reason === "invalid_answer" ||
    reason === "section_closed" ||
    reason === "expired" ||
    reason === "ok"
  ) {
    return reason;
  }
  return "not_found";
}

/** Load all answers for a session (used at result computation) */
export async function getResponsesBySession(sessionId: number): Promise<TestResponse[]> {
  const rows = await sql`
    SELECT * FROM test_responses WHERE session_id = ${asId(sessionId)} ORDER BY item_id
  `;
  return (rows as TestResponse[]).map((row) => ({
    ...row,
    id: asId(row.id),
    session_id: asId(row.session_id),
    item_id: asId(row.item_id),
  }));
}
