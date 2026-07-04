import { sql } from "@/lib/db";
import type { TestResponse } from "@/types/db";

/** Upsert one answer (called on every question submit) */
export async function upsertResponse(input: {
  session_id: number;
  item_id: number;
  answer_value: string;
}): Promise<TestResponse> {
  const rows = await sql`
    INSERT INTO test_responses (session_id, item_id, answer_value, answered_at)
    VALUES (${input.session_id}, ${input.item_id}, ${input.answer_value}, now())
    ON CONFLICT (session_id, item_id) DO UPDATE
      SET answer_value = ${input.answer_value}, answered_at = now()
    RETURNING *
  `;
  return rows[0] as TestResponse;
}

/** Load all answers for a session (used at result computation) */
export async function getResponsesBySession(sessionId: number): Promise<TestResponse[]> {
  const rows = await sql`
    SELECT * FROM test_responses WHERE session_id = ${sessionId} ORDER BY item_id
  `;
  return rows as TestResponse[];
}
