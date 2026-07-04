import { sql } from "@/lib/db";
import type { CorporateInquiry } from "@/types/db";

export async function createCorporateInquiry(input: {
  full_name: string;
  company_name: string;
  position?: string;
  whatsapp_number: string;
  interested_service?: string;
  message?: string;
}): Promise<CorporateInquiry> {
  const rows = await sql`
    INSERT INTO corporate_inquiries
      (full_name, company_name, position, whatsapp_number, interested_service, message, status)
    VALUES
      (${input.full_name}, ${input.company_name}, ${input.position ?? null},
       ${input.whatsapp_number}, ${input.interested_service ?? null}, ${input.message ?? null}, 'new')
    RETURNING *
  `;
  return rows[0] as CorporateInquiry;
}

export async function getAllCorporateInquiries(): Promise<CorporateInquiry[]> {
  const rows = await sql`SELECT * FROM corporate_inquiries ORDER BY created_at DESC`;
  return rows as CorporateInquiry[];
}

export async function updateInquiryStatus(id: number, status: CorporateInquiry["status"]) {
  const rows = await sql`
    UPDATE corporate_inquiries SET status = ${status}, updated_at = now()
    WHERE id = ${id} RETURNING *
  `;
  return rows[0];
}
