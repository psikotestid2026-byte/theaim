import { sql } from "@/lib/db";

export type MasterTestListRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  duration_sec: number;
  total_questions: number;
  is_active: boolean;
  formula_type: string | null;
};

export async function listMasterTests(): Promise<MasterTestListRow[]> {
  const rows = await sql`
    SELECT mt.id,
           mt.code,
           mt.name,
           mt.category,
           mt.duration_sec,
           mt.total_questions,
           mt.is_active,
           sc.formula_type
    FROM master_tests mt
    LEFT JOIN scoring_configs sc ON sc.test_id = mt.id
    ORDER BY mt.category, mt.code
  `;
  return rows as MasterTestListRow[];
}
