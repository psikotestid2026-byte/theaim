import { sql } from "@/lib/db";
import { asId } from "@/lib/ids";
import type { TestItem } from "@/types/db";

function normalizeItem(row: TestItem): TestItem {
  return { ...row, id: asId(row.id), item_order: Number(row.item_order) };
}

export async function getItemForTest(itemId: number, testCode: string): Promise<TestItem | null> {
  const rows = await sql`
    SELECT * FROM test_items
    WHERE id = ${asId(itemId)} AND test_code = ${testCode}
    LIMIT 1
  `;
  const row = rows[0] as TestItem | undefined;
  return row ? normalizeItem(row) : null;
}

export async function getItemsByTestCode(testCode: string): Promise<TestItem[]> {
  const rows = await sql`
    SELECT * FROM test_items WHERE test_code = ${testCode} ORDER BY item_order ASC
  `;
  return (rows as TestItem[]).map(normalizeItem);
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
