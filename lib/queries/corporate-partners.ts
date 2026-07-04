import { sql } from "@/lib/db";
import type { CorporatePartner } from "@/types/db";

export async function getActivePartners(): Promise<CorporatePartner[]> {
  const rows = await sql`
    SELECT * FROM corporate_partners WHERE status = 'active' ORDER BY display_order ASC
  `;
  return rows as CorporatePartner[];
}

export async function getAllPartners(): Promise<CorporatePartner[]> {
  const rows = await sql`SELECT * FROM corporate_partners ORDER BY display_order ASC`;
  return rows as CorporatePartner[];
}

export async function createPartner(input: Partial<CorporatePartner>) {
  const rows = await sql`
    INSERT INTO corporate_partners (name, logo_url, partnership_type, status, display_order)
    VALUES (${input.name}, ${input.logo_url}, ${input.partnership_type ?? "client"},
            ${input.status ?? "active"}, ${input.display_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}
