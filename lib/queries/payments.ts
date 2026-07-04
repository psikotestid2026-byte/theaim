import { sql } from "@/lib/db";
import type { Payment } from "@/types/db";

export async function createPayment(input: {
  registration_id: number;
  payment_method_id: number;
  payment_code: string;
  amount: number;
}): Promise<Payment> {
  const rows = await sql`
    INSERT INTO payments (registration_id, payment_method_id, payment_code, amount, status)
    VALUES (${input.registration_id}, ${input.payment_method_id}, ${input.payment_code}, ${input.amount}, 'awaiting_confirmation')
    RETURNING *
  `;
  return rows[0] as Payment;
}

export async function getPaymentsByRegistration(registrationId: number): Promise<Payment[]> {
  const rows = await sql`
    SELECT p.*, pm.name AS method_name, r.registration_code
    FROM payments p
    JOIN payment_methods pm ON pm.id = p.payment_method_id
    JOIN registrations r ON r.id = p.registration_id
    WHERE p.registration_id = ${registrationId}
    ORDER BY p.created_at DESC
  `;
  return rows as Payment[];
}

export async function getAllPayments(limit = 50, offset = 0): Promise<Payment[]> {
  const rows = await sql`
    SELECT p.*, pm.name AS method_name, r.registration_code
    FROM payments p
    JOIN payment_methods pm ON pm.id = p.payment_method_id
    JOIN registrations r ON r.id = p.registration_id
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as Payment[];
}

export async function confirmPayment(id: number, confirmedBy: number): Promise<Payment> {
  const rows = await sql`
    UPDATE payments
    SET status = 'confirmed', confirmed_by = ${confirmedBy}, confirmed_at = now(), updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] as Payment;
}

export async function updatePaymentProof(id: number, proofUrl: string) {
  const rows = await sql`
    UPDATE payments SET proof_file_url = ${proofUrl}, updated_at = now()
    WHERE id = ${id} RETURNING *
  `;
  return rows[0];
}

export async function countPendingPayments(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM payments WHERE status = 'awaiting_confirmation'
  `;
  return (rows[0] as { count: number }).count;
}

export async function getNextPaymentSeq(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int + 1 AS seq FROM payments`;
  return (rows[0] as { seq: number }).seq;
}
