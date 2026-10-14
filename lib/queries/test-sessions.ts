import { sql } from "@/lib/db";
import { asCount, asId } from "@/lib/ids";
import { parseIstMemorizeList } from "@/lib/ist-config";
import { IST_SUBTEST_CODES, type IstMemorizeList } from "@/lib/ist-types";
import type { TestSession } from "@/types/db";

const MAX_CONFIRM_ATTEMPTS = 3;

export { MAX_CONFIRM_ATTEMPTS };

function normalizeSession(row: TestSession | undefined): TestSession | null {
  if (!row) return null;
  return {
    ...row,
    id: asId(row.id),
    customer_id: asId(row.customer_id),
    package_id: asId(row.package_id),
    registration_id: row.registration_id == null ? null : asId(row.registration_id),
    confirm_attempts: asCount(row.confirm_attempts),
  };
}

export async function getSessionByAccessToken(token: string): Promise<TestSession | null> {
  const rows = await sql`
    SELECT s.id, s.registration_id, s.customer_id, s.package_id, s.test_code,
           s.access_token, s.result_token, s.status, s.confirm_attempts, s.locked_at,
           s.issued_at, s.expires_at, s.started_at, s.completed_at, s.created_at, s.updated_at,
           c.whatsapp_number, c.full_name AS customer_name, sp.name AS package_name
    FROM test_sessions s
    JOIN customers c ON c.id = s.customer_id
    JOIN service_packages sp ON sp.id = s.package_id
    WHERE s.access_token = ${token}
    LIMIT 1
  `;
  return normalizeSession(rows[0] as TestSession | undefined);
}

export async function getSessionByResultToken(token: string): Promise<TestSession | null> {
  const rows = await sql`
    SELECT s.id, s.registration_id, s.customer_id, s.package_id, s.test_code,
           s.access_token, s.result_token, s.status, s.confirm_attempts, s.locked_at,
           s.issued_at, s.expires_at, s.started_at, s.completed_at, s.created_at, s.updated_at,
           c.whatsapp_number, c.full_name AS customer_name, sp.name AS package_name
    FROM test_sessions s
    JOIN customers c ON c.id = s.customer_id
    JOIN service_packages sp ON sp.id = s.package_id
    WHERE s.result_token = ${token}
    LIMIT 1
  `;
  return normalizeSession(rows[0] as TestSession | undefined);
}

export async function createTestSession(input: {
  registration_id?: number;
  customer_id: number;
  package_id: number;
  test_code: string;
  access_token: string;
  result_token: string;
  expires_at: Date;
}): Promise<TestSession> {
  const rows = await sql`
    INSERT INTO test_sessions
      (registration_id, customer_id, package_id, test_code, access_token, result_token, status, expires_at)
    VALUES
      (${input.registration_id ?? null}, ${input.customer_id}, ${input.package_id},
       ${input.test_code}, ${input.access_token}, ${input.result_token}, 'issued', ${input.expires_at})
    RETURNING *
  `;
  return rows[0] as TestSession;
}

/**
 * One-way completion. Only a confirmed in-progress session can finish.
 * Completed, locked, revoked, expired, and still-issued rows stay as they are.
 */
export async function markSessionCompleted(id: number) {
  const rows = await sql`
    UPDATE test_sessions
    SET status = 'completed',
        completed_at = COALESCE(completed_at, now()),
        updated_at = now()
    WHERE id = ${asId(id)}
      AND status = 'in_progress'
    RETURNING id
  `;
  return rows[0] ?? null;
}

export async function updateSessionStatus(
  id: number,
  status: TestSession["status"],
  extra?: { started_at?: Date; completed_at?: Date }
) {
  // Neon sends parameters as text. An uncast COALESCE(text, timestamp) errors.
  const startedAt = extra?.started_at ? extra.started_at.toISOString() : null;
  const completedAt = extra?.completed_at ? extra.completed_at.toISOString() : null;
  const rows = await sql`
    UPDATE test_sessions
    SET status = ${status},
        started_at = COALESCE(${startedAt}::timestamp, started_at),
        completed_at = COALESCE(${completedAt}::timestamp, completed_at),
        updated_at = now()
    WHERE id = ${asId(id)}
    RETURNING *
  `;
  return rows[0];
}

export async function incrementConfirmAttempts(id: number, newAttempts: number) {
  const rows = await sql`
    UPDATE test_sessions
    SET confirm_attempts = ${newAttempts}, updated_at = now()
    WHERE id = ${id} AND confirm_attempts < ${MAX_CONFIRM_ATTEMPTS}
    RETURNING confirm_attempts
  `;
  return rows[0];
}

export async function lockSession(id: number) {
  const rows = await sql`
    UPDATE test_sessions
    SET status = 'locked', locked_at = now(), updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function readAttemptTimer(id: number): Promise<{ timer_started_at: string | null; server_now: string } | null> {
  const rows = await sql`
    SELECT timer_started_at, now() AS server_now
    FROM test_sessions
    WHERE id = ${asId(id)}
      AND status = 'in_progress'
    LIMIT 1
  `;
  return (rows[0] as { timer_started_at: string | null; server_now: string } | undefined) ?? null;
}

/**
 * Starts the countdown once. Later calls keep the original timestamp.
 * Only an in-progress session can start; completed rows are left alone.
 */
export async function markTimerStarted(id: number): Promise<{ timer_started_at: string; server_now: string } | null> {
  const rows = await sql`
    UPDATE test_sessions
    SET timer_started_at = COALESCE(timer_started_at, now()),
        updated_at = CASE WHEN timer_started_at IS NULL THEN now() ELSE updated_at END
    WHERE id = ${asId(id)}
      AND status = 'in_progress'
    RETURNING timer_started_at, now() AS server_now
  `;
  return (rows[0] as { timer_started_at: string; server_now: string } | undefined) ?? null;
}

export async function revokeSession(id: number) {
  const rows = await sql`
    UPDATE test_sessions
    SET status = 'revoked', updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function getAllTestSessions(limit = 50, offset = 0): Promise<TestSession[]> {
  const rows = await sql`
    SELECT s.*, c.full_name AS customer_name, c.whatsapp_number, sp.name AS package_name
    FROM test_sessions s
    JOIN customers c ON c.id = s.customer_id
    JOIN service_packages sp ON sp.id = s.package_id
    ORDER BY s.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as TestSession[];
}

export async function countActiveSessions(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM test_sessions WHERE status IN ('issued', 'in_progress')
  `;
  return (rows[0] as { count: number }).count;
}

export type SectionTimers = { starts: Record<string, number>; nowMs: number };

export function sectionStartsFrom(raw: unknown): Record<string, number> {
  const starts: Record<string, number> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [code, value] of Object.entries(raw as Record<string, unknown>)) {
      const ms = Number(value);
      if (Number.isFinite(ms)) starts[code] = ms;
    }
  }
  return starts;
}

function toSectionTimers(row: { section_started_at?: unknown; server_now_ms?: unknown } | undefined): SectionTimers | null {
  if (!row) return null;
  const nowMs = Number(row.server_now_ms);
  return Number.isFinite(nowMs) ? { starts: sectionStartsFrom(row.section_started_at), nowMs } : null;
}

/** IST subtest clocks (epoch ms per subtest) plus the database clock. In-progress sessions only. */
export async function readSectionTimers(id: number): Promise<SectionTimers | null> {
  const rows = await sql`
    SELECT section_started_at, (extract(epoch from clock_timestamp()) * 1000)::bigint AS server_now_ms
    FROM test_sessions
    WHERE id = ${asId(id)}
      AND status = 'in_progress'
    LIMIT 1
  `;
  return toSectionTimers(rows[0] as { section_started_at?: unknown; server_now_ms?: unknown } | undefined);
}

/**
 * Starts one IST subtest clock. The first write wins; later calls keep the
 * original start, so reloading never restarts a subtest.
 */
export async function startSectionTimer(id: number, section: string): Promise<SectionTimers | null> {
  await sql`
    UPDATE test_sessions
    SET section_started_at = section_started_at || jsonb_build_object(${section}::text, (extract(epoch from clock_timestamp()) * 1000)::bigint),
        timer_started_at = COALESCE(timer_started_at, now()),
        updated_at = now()
    WHERE id = ${asId(id)}
      AND status = 'in_progress'
      AND NOT (section_started_at ? ${section}::text)
  `;
  return readSectionTimers(id);
}

export type ConfirmIdentity = {
  found: boolean;
  id: number | null;
  status: string | null;
  testCode: string | null;
  resultToken: string | null;
  confirmAttempts: number;
  digitsOk: boolean;
  confirmed: boolean;
  lockedNow: boolean;
  wrongAttempts: number | null;
};

function flag(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

/**
 * One round trip for identity confirmation.
 * A correct last-4 moves only `issued` or `confirming` to `in_progress`.
 * A wrong last-4 increments attempts and locks at 3, in the same statement.
 * Completed, in-progress, locked, expired, and revoked rows are not updated.
 */
export async function confirmIdentity(token: string, last4: string): Promise<ConfirmIdentity> {
  const rows = await sql`
    WITH sess AS (
      SELECT s.id, s.status, s.test_code, s.result_token, s.confirm_attempts,
             right(c.whatsapp_number, 4) AS last4
      FROM test_sessions s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.access_token = ${token}
    ),
    updated AS (
      UPDATE test_sessions
      SET status = 'in_progress',
          started_at = COALESCE(started_at, now()),
          updated_at = now()
      WHERE id = (SELECT id FROM sess)
        AND status IN ('issued', 'confirming')
        AND (SELECT last4 FROM sess) IS NOT DISTINCT FROM ${last4}
      RETURNING id
    ),
    wrong AS (
      UPDATE test_sessions
      SET confirm_attempts = confirm_attempts + 1,
          status = CASE
            WHEN confirm_attempts + 1 >= ${MAX_CONFIRM_ATTEMPTS} THEN 'locked'
            ELSE status
          END,
          locked_at = CASE
            WHEN confirm_attempts + 1 >= ${MAX_CONFIRM_ATTEMPTS} THEN now()
            ELSE locked_at
          END,
          updated_at = now()
      WHERE id = (SELECT id FROM sess)
        AND status IN ('issued', 'confirming')
        AND (SELECT last4 FROM sess) IS DISTINCT FROM ${last4}
        AND confirm_attempts < ${MAX_CONFIRM_ATTEMPTS}
      RETURNING confirm_attempts, status
    )
    SELECT
      EXISTS (SELECT 1 FROM sess) AS found,
      (SELECT id FROM sess) AS id,
      (SELECT status FROM sess) AS status,
      (SELECT test_code FROM sess) AS test_code,
      (SELECT result_token FROM sess) AS result_token,
      (SELECT confirm_attempts FROM sess) AS confirm_attempts,
      (SELECT last4 FROM sess) IS NOT DISTINCT FROM ${last4} AS digits_ok,
      (SELECT id FROM updated) IS NOT NULL AS confirmed,
      (SELECT status FROM wrong) = 'locked' AS locked_now,
      (SELECT confirm_attempts FROM wrong) AS wrong_attempts
  `;
  const row = rows[0] as {
    found?: unknown;
    id?: unknown;
    status?: unknown;
    test_code?: unknown;
    result_token?: unknown;
    confirm_attempts?: unknown;
    digits_ok?: unknown;
    confirmed?: unknown;
    locked_now?: unknown;
    wrong_attempts?: unknown;
  };
  const wrongAttempts = row?.wrong_attempts == null || row.wrong_attempts === "" ? null : asCount(row.wrong_attempts);
  return {
    found: flag(row?.found),
    id: row?.id == null || row.id === "" ? null : asId(row.id as number),
    status: typeof row?.status === "string" ? row.status : null,
    testCode: typeof row?.test_code === "string" ? row.test_code : null,
    resultToken: typeof row?.result_token === "string" ? row.result_token : null,
    confirmAttempts: asCount(row?.confirm_attempts),
    digitsOk: flag(row?.digits_ok),
    confirmed: flag(row?.confirmed),
    lockedNow: flag(row?.locked_now),
    wrongAttempts,
  };
}

export type OpenIstSection =
  | { action: "missing" }
  | { action: "completed" }
  | { action: "not_confirmed" }
  | { action: "not_sectioned" }
  | { action: "timer_unavailable" }
  | { action: "config_unavailable" }
  | { action: "unknown_section" | "out_of_order" | "section_closed"; starts: Record<string, number>; nowMs: number }
  | { action: "read" | "already" | "start"; starts: Record<string, number>; nowMs: number; memorizeList: IstMemorizeList | null };

/**
 * Read or start one IST subtest clock, and include the ME word list when that
 * clock is still in its memorize phase. One statement. The list is null unless
 * ME is the latest started subtest and the memorize window is still open.
 * A completed session is not updated.
 */
export async function openIstSection(token: string, sessionId: number, section: string | null): Promise<OpenIstSection> {
  const istCodes = IST_SUBTEST_CODES.join(",");
  const rows = await sql`
    WITH sess AS (
      SELECT s.id, s.status, s.test_code,
             COALESCE(s.section_started_at, '{}'::jsonb) AS section_started_at,
             (extract(epoch from clock_timestamp()) * 1000)::bigint AS now_ms
      FROM test_sessions s
      WHERE s.access_token = ${token}
        AND s.id = ${asId(sessionId)}
    ),
    sched AS (
      SELECT raw.ord, raw.code, raw.memorize_sec, raw.memorize_list
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
               END AS time_limit_sec,
               CASE
                 WHEN upper(btrim(elem.item->>'code')) = 'ME' THEN elem.item->'memorizeList'
                 ELSE NULL
               END AS memorize_list
        FROM scoring_configs sc
        JOIN master_tests mt ON mt.id = sc.test_id
        CROSS JOIN LATERAL jsonb_array_elements(sc.config_data->'subtests') WITH ORDINALITY AS elem(item, ord)
        WHERE lower(mt.code) = 'ist'
          AND EXISTS (SELECT 1 FROM sess WHERE lower(test_code) = 'ist')
          AND upper(btrim(elem.item->>'code')) = ANY (string_to_array(${istCodes}, ','))
      ) raw
      WHERE raw.time_limit_sec IS NOT NULL AND raw.time_limit_sec > 0
    ),
    decision AS (
      SELECT CASE
        WHEN NOT EXISTS (SELECT 1 FROM sess) THEN 'missing'
        WHEN (SELECT status FROM sess) = 'completed' THEN 'completed'
        WHEN (SELECT status FROM sess) IS DISTINCT FROM 'in_progress' THEN 'not_confirmed'
        WHEN lower((SELECT test_code FROM sess)) IS DISTINCT FROM 'ist' THEN 'not_sectioned'
        WHEN ${section}::text IS NULL OR btrim(${section}::text) = '' THEN 'read'
        WHEN NOT EXISTS (SELECT 1 FROM sched) THEN 'config_unavailable'
        WHEN NOT EXISTS (SELECT 1 FROM sched WHERE code = upper(btrim(${section}::text))) THEN 'unknown_section'
        WHEN EXISTS (
          SELECT 1 FROM sched
          WHERE code = upper(btrim(${section}::text))
            AND (SELECT section_started_at FROM sess) ? code
        ) THEN 'already'
        WHEN EXISTS (
          SELECT 1 FROM sched later
          WHERE later.ord > (SELECT ord FROM sched WHERE code = upper(btrim(${section}::text)))
            AND (SELECT section_started_at FROM sess) ? later.code
        ) THEN 'section_closed'
        WHEN EXISTS (
          SELECT 1 FROM sched earlier
          WHERE earlier.ord < (SELECT ord FROM sched WHERE code = upper(btrim(${section}::text)))
            AND NOT ((SELECT section_started_at FROM sess) ? earlier.code)
        ) THEN 'out_of_order'
        ELSE 'start'
      END AS action
    ),
    started AS (
      UPDATE test_sessions
      SET section_started_at = COALESCE(section_started_at, '{}'::jsonb) || jsonb_build_object(
            COALESCE(upper(btrim(${section}::text)), ''),
            (extract(epoch from clock_timestamp()) * 1000)::bigint
          ),
          timer_started_at = COALESCE(timer_started_at, now()),
          updated_at = now()
      WHERE id = (SELECT id FROM sess)
        AND status = 'in_progress'
        AND (SELECT action FROM decision) = 'start'
        AND ${section}::text IS NOT NULL
        AND NOT (COALESCE(section_started_at, '{}'::jsonb) ? upper(btrim(${section}::text)))
      RETURNING section_started_at, (extract(epoch from clock_timestamp()) * 1000)::bigint AS now_ms
    ),
    clock AS (
      SELECT
        COALESCE((SELECT section_started_at FROM started), (SELECT section_started_at FROM sess), '{}'::jsonb) AS starts,
        COALESCE((SELECT now_ms FROM started), (SELECT now_ms FROM sess)) AS now_ms
    ),
    opened AS (
      SELECT
        CASE
          WHEN me.memorize_sec IS NULL OR me.memorize_sec <= 0 THEN false
          WHEN NOT ((SELECT starts FROM clock) ? 'ME') THEN false
          WHEN ((SELECT starts FROM clock)->>'ME') !~ '^[0-9]+$' THEN false
          WHEN me.ord IS DISTINCT FROM (
            SELECT max(sch.ord) FROM sched sch WHERE (SELECT starts FROM clock) ? sch.code
          ) THEN false
          WHEN GREATEST(
                 (SELECT now_ms FROM clock)::numeric,
                 ((SELECT starts FROM clock)->>'ME')::numeric
               ) >= ((SELECT starts FROM clock)->>'ME')::numeric + me.memorize_sec * 1000 THEN false
          ELSE true
        END AS memorize_open,
        me.memorize_list
      FROM (SELECT ord, memorize_sec, memorize_list FROM sched WHERE code = 'ME' LIMIT 1) me
    )
    SELECT
      (SELECT action FROM decision) AS action,
      COALESCE((SELECT starts FROM clock), '{}'::jsonb) AS starts,
      (SELECT now_ms FROM clock) AS now_ms,
      COALESCE((SELECT memorize_open FROM opened), false) AS memorize_open,
      CASE
        WHEN COALESCE((SELECT memorize_open FROM opened), false)
        THEN (SELECT memorize_list FROM opened)
        ELSE NULL
      END AS memorize_list
  `;
  const row = rows[0] as {
    action?: unknown;
    starts?: unknown;
    now_ms?: unknown;
    memorize_open?: unknown;
    memorize_list?: unknown;
  };
  const action = typeof row?.action === "string" ? row.action : "missing";
  if (action === "missing" || action === "completed" || action === "not_confirmed" || action === "not_sectioned" || action === "config_unavailable") {
    return { action };
  }
  const nowMs = Number(row?.now_ms);
  if (!Number.isFinite(nowMs)) return { action: "timer_unavailable" };
  const starts = sectionStartsFrom(row?.starts);
  if (action === "unknown_section" || action === "out_of_order" || action === "section_closed") {
    return { action, starts, nowMs };
  }
  if (action === "start" && section && typeof starts[section.trim().toUpperCase()] !== "number") {
    return { action: "timer_unavailable" };
  }
  if (action !== "read" && action !== "already" && action !== "start") return { action: "timer_unavailable" };
  const memorizeList = flag(row?.memorize_open) ? parseIstMemorizeList(row?.memorize_list) : null;
  return { action, starts, nowMs, memorizeList };
}
