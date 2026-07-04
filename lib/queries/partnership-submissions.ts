import { sql } from "@/lib/db";
import type { PartnershipSubmission } from "@/types/db";

export async function createPartnershipSubmission(input: {
  pic_full_name: string;
  pic_whatsapp_number: string;
  organization_name: string;
  collaboration_title: string;
  idea_description: string;
  expected_role?: string;
  collaboration_goal?: string;
  estimated_timeline?: string;
  proposal_file_url?: string;
  previous_relation?: "yes" | "no";
}): Promise<PartnershipSubmission> {
  const rows = await sql`
    INSERT INTO partnership_submissions
      (pic_full_name, pic_whatsapp_number, organization_name, collaboration_title,
       idea_description, expected_role, collaboration_goal, estimated_timeline,
       proposal_file_url, previous_relation, status)
    VALUES
      (${input.pic_full_name}, ${input.pic_whatsapp_number}, ${input.organization_name},
       ${input.collaboration_title}, ${input.idea_description}, ${input.expected_role ?? null},
       ${input.collaboration_goal ?? null}, ${input.estimated_timeline ?? null},
       ${input.proposal_file_url ?? null}, ${input.previous_relation ?? "no"}, 'submitted')
    RETURNING *
  `;
  return rows[0] as PartnershipSubmission;
}

export async function getAllPartnershipSubmissions(): Promise<PartnershipSubmission[]> {
  const rows = await sql`SELECT * FROM partnership_submissions ORDER BY created_at DESC`;
  return rows as PartnershipSubmission[];
}
