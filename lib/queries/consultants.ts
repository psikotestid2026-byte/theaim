import { sql } from "@/lib/db";
import type { Consultant } from "@/types/db";

export async function getActiveConsultants(): Promise<Consultant[]> {
  const rows = await sql`
    SELECT * FROM consultants WHERE status = 'active' ORDER BY full_name
  `;
  return rows as Consultant[];
}

export async function getConsultantsByService(serviceId: number): Promise<Consultant[]> {
  const rows = await sql`
    SELECT c.* FROM consultants c
    JOIN service_consultants sc ON sc.consultant_id = c.id
    WHERE sc.service_id = ${serviceId} AND c.status = 'active'
    ORDER BY c.full_name
  `;
  return rows as Consultant[];
}

export async function getAllConsultants(): Promise<Consultant[]> {
  const rows = await sql`SELECT * FROM consultants ORDER BY full_name`;
  return rows as Consultant[];
}

export async function createConsultant(input: Partial<Consultant>) {
  const rows = await sql`
    INSERT INTO consultants (full_name, role_title, specialization, certification, bio, photo_url, status)
    VALUES (${input.full_name}, ${input.role_title}, ${input.specialization ?? null},
            ${input.certification ?? null}, ${input.bio ?? null}, ${input.photo_url ?? null}, 'active')
    RETURNING *
  `;
  return rows[0];
}
