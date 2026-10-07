import { sql } from "@/lib/db";
import { asCount, asId } from "@/lib/ids";
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
