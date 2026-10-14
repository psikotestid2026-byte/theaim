import { sql } from "@/lib/db";
import { asId } from "@/lib/ids";
import { sectionStartsFrom } from "@/lib/queries/test-sessions";
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
