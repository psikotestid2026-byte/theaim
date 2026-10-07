import { sql } from "@/lib/db";
import type { TmResultsReady } from "@/lib/scoring/talents-mapping";

export type TmResultRow = TmResultsReady & {
  strength_potentials: unknown[];
  st30_scores: unknown[];
  personal_branding: unknown[];
  career_recommendations: unknown[];
};

export async function insertTmResultOnce(input: {
  test_result_id: number;
  session_id: number;
  customer_id: number;
  tm: TmResultsReady;
}): Promise<void> {
  await sql`
    INSERT INTO tm_results (
      test_result_id, session_id, customer_id, talent_ranking, domain_distribution
    ) VALUES (
      ${input.test_result_id},
      ${input.session_id},
      ${input.customer_id},
      ${JSON.stringify(input.tm.talent_ranking)},
      ${JSON.stringify(input.tm.domain_distribution)}
    )
    ON CONFLICT (session_id) DO NOTHING
  `;
}

export async function getTmResultBySessionId(sessionId: number): Promise<TmResultRow | null> {
  const rows = await sql`
    SELECT talent_ranking,
           domain_distribution,
           strength_potentials,
           st30_scores,
           personal_branding,
           career_recommendations
    FROM tm_results
    WHERE session_id = ${sessionId}
    LIMIT 1
  `;
  return (rows[0] as TmResultRow) ?? null;
}
