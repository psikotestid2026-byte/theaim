import { sql } from "@/lib/db";
import type { TestResult, TestResultPayload } from "@/types/db";

export async function createTestResult(
  sessionId: number,
  testCode: string,
  payload: TestResultPayload
): Promise<TestResult> {
  const rows = await sql`
    INSERT INTO test_results
      (session_id, test_code, raw_scores, result_type, result_label, interpretation, wa_summary_text)
    VALUES
      (${sessionId}, ${testCode}, ${JSON.stringify(payload.raw_scores)},
       ${payload.result_type}, ${payload.result_label},
       ${JSON.stringify(payload.interpretation)}, ${payload.wa_summary_text})
    RETURNING *
  `;
  return rows[0] as TestResult;
}

export async function getResultBySessionId(sessionId: number): Promise<TestResult | null> {
  const rows = await sql`
    SELECT tr.*, c.full_name AS customer_name, c.whatsapp_number
    FROM test_results tr
    JOIN test_sessions ts ON ts.id = tr.session_id
    JOIN customers c ON c.id = ts.customer_id
    WHERE tr.session_id = ${sessionId}
    LIMIT 1
  `;
  return (rows[0] as TestResult) ?? null;
}

export async function getAllTestResults(limit = 50, offset = 0): Promise<TestResult[]> {
  const rows = await sql`
    SELECT tr.*, c.full_name AS customer_name, c.whatsapp_number
    FROM test_results tr
    JOIN test_sessions ts ON ts.id = tr.session_id
    JOIN customers c ON c.id = ts.customer_id
    ORDER BY tr.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as TestResult[];
}
