import { sql } from "@/lib/db";
import type { TestItem } from "@/types/db";

export async function getItemsByTestCode(testCode: string): Promise<TestItem[]> {
  const rows = await sql`
    SELECT * FROM test_items WHERE test_code = ${testCode} ORDER BY item_order ASC
  `;
  return rows as TestItem[];
}

export async function getAllTestItems(testCode?: string): Promise<TestItem[]> {
  if (testCode) {
    const rows = await sql`
      SELECT * FROM test_items WHERE test_code = ${testCode} ORDER BY item_order ASC
    `;
    return rows as TestItem[];
  }
  const rows = await sql`
    SELECT * FROM test_items ORDER BY test_code, item_order
  `;
  return rows as TestItem[];
}

export async function getDistinctTestCodes(): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT test_code FROM test_items ORDER BY test_code
  `;
  return rows.map((r: any) => r.test_code as string);
}
