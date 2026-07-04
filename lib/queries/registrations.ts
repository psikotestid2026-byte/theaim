import { sql } from "@/lib/db";
import type { Registration } from "@/types/db";

export async function createRegistration(input: {
  registration_code: string;
  customer_id: number;
  service_id: number;
  package_id?: number;
  full_name: string;
  whatsapp_number: string;
  notes?: string;
  price_quoted?: number | string | null;
}): Promise<Registration> {
  const rows = await sql`
    INSERT INTO registrations
      (registration_code, customer_id, service_id, package_id, full_name, whatsapp_number, notes, price_quoted, status)
    VALUES
      (${input.registration_code}, ${input.customer_id}, ${input.service_id},
       ${input.package_id ?? null}, ${input.full_name}, ${input.whatsapp_number},
       ${input.notes ?? null}, ${input.price_quoted ?? null}, 'pending_confirmation')
    RETURNING *
  `;
  return rows[0] as Registration;
}

export async function getRegistrationByCode(code: string): Promise<Registration | null> {
  const rows = await sql`
    SELECT r.*, s.name AS service_name, sp.name AS package_name,
           c.full_name AS customer_name, c.whatsapp_number AS customer_wa
    FROM registrations r
    JOIN services s ON s.id = r.service_id
    LEFT JOIN service_packages sp ON sp.id = r.package_id
    JOIN customers c ON c.id = r.customer_id
    WHERE r.registration_code = ${code}
    LIMIT 1
  `;
  return (rows[0] as Registration) ?? null;
}

export async function getRegistrationById(id: number): Promise<Registration | null> {
  const rows = await sql`
    SELECT r.*, s.name AS service_name, sp.name AS package_name,
           c.full_name AS customer_name
    FROM registrations r
    JOIN services s ON s.id = r.service_id
    LEFT JOIN service_packages sp ON sp.id = r.package_id
    JOIN customers c ON c.id = r.customer_id
    WHERE r.id = ${id}
    LIMIT 1
  `;
  return (rows[0] as Registration) ?? null;
}

export async function getAllRegistrations(limit = 50, offset = 0): Promise<Registration[]> {
  const rows = await sql`
    SELECT r.*, s.name AS service_name, sp.name AS package_name,
           c.full_name AS customer_name
    FROM registrations r
    JOIN services s ON s.id = r.service_id
    LEFT JOIN service_packages sp ON sp.id = r.package_id
    JOIN customers c ON c.id = r.customer_id
    ORDER BY r.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as Registration[];
}

export async function updateRegistrationStatus(
  id: number,
  status: Registration["status"],
  extra?: { price_quoted?: number; scheduled_at?: Date; assigned_consultant_id?: number }
) {
  const rows = await sql`
    UPDATE registrations
    SET status = ${status},
        price_quoted = COALESCE(${extra?.price_quoted ?? null}, price_quoted),
        scheduled_at = COALESCE(${extra?.scheduled_at ?? null}, scheduled_at),
        assigned_consultant_id = COALESCE(${extra?.assigned_consultant_id ?? null}, assigned_consultant_id),
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function getNextRegistrationSeq(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int + 1 AS seq FROM registrations`;
  return (rows[0] as { seq: number }).seq;
}

export async function countRegistrations(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM registrations`;
  return (rows[0] as { count: number }).count;
}
