import { sql } from "@/lib/db";
import type { PaymentInstruction } from "@/types/db";

export async function getInstructionsByMethod(methodId: number): Promise<PaymentInstruction[]> {
  const rows = await sql`
    SELECT * FROM payment_instructions
    WHERE payment_method_id = ${methodId}
    ORDER BY sort_order ASC
  `;
  return rows as PaymentInstruction[];
}

export async function getAllInstructions(): Promise<PaymentInstruction[]> {
  const rows = await sql`
    SELECT pi.*, pm.name AS method_name
    FROM payment_instructions pi
    JOIN payment_methods pm ON pm.id = pi.payment_method_id
    ORDER BY pm.sort_order, pi.sort_order
  `;
  return rows as PaymentInstruction[];
}
