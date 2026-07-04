import { sql } from "@/lib/db";
import type { Customer } from "@/types/db";

export async function findOrCreateCustomer(input: {
  full_name: string;
  whatsapp_number: string;
  email?: string;
}): Promise<Customer> {
  // Try to find by WA number first
  const existing = await sql`
    SELECT * FROM customers WHERE whatsapp_number = ${input.whatsapp_number} LIMIT 1
  `;
  if (existing[0]) return existing[0] as Customer;

  const rows = await sql`
    INSERT INTO customers (full_name, whatsapp_number, email)
    VALUES (${input.full_name}, ${input.whatsapp_number}, ${input.email ?? null})
    RETURNING *
  `;
  return rows[0] as Customer;
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const rows = await sql`SELECT * FROM customers WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Customer) ?? null;
}

export async function getAllCustomers(limit = 50, offset = 0): Promise<Customer[]> {
  const rows = await sql`
    SELECT * FROM customers ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as Customer[];
}

export async function countCustomers(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM customers`;
  return (rows[0] as { count: number }).count;
}
