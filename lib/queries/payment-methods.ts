import { sql } from "@/lib/db";
import type { PaymentMethod } from "@/types/db";

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const rows = await sql`
    SELECT * FROM payment_methods WHERE is_active = true ORDER BY sort_order ASC
  `;
  return rows as PaymentMethod[];
}

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  const rows = await sql`SELECT * FROM payment_methods ORDER BY sort_order ASC`;
  return rows as PaymentMethod[];
}

export async function getPaymentMethodById(id: number): Promise<PaymentMethod | null> {
  const rows = await sql`SELECT * FROM payment_methods WHERE id = ${id} LIMIT 1`;
  return (rows[0] as PaymentMethod) ?? null;
}

export async function togglePaymentMethod(id: number, isActive: boolean) {
  const rows = await sql`
    UPDATE payment_methods SET is_active = ${isActive}, updated_at = now()
    WHERE id = ${id} RETURNING *
  `;
  return rows[0];
}
