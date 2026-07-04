import { sql } from "@/lib/db";
import type { ProposalDownloadLead } from "@/types/db";

export async function createProposalLead(input: {
  full_name: string;
  whatsapp_number: string;
  company_name?: string;
  position?: string;
}): Promise<ProposalDownloadLead> {
  const rows = await sql`
    INSERT INTO proposal_download_leads (full_name, whatsapp_number, company_name, position)
    VALUES (${input.full_name}, ${input.whatsapp_number},
            ${input.company_name ?? null}, ${input.position ?? null})
    RETURNING *
  `;
  return rows[0] as ProposalDownloadLead;
}

export async function getAllProposalLeads(): Promise<ProposalDownloadLead[]> {
  const rows = await sql`SELECT * FROM proposal_download_leads ORDER BY created_at DESC`;
  return rows as ProposalDownloadLead[];
}
