import { sql } from "@/lib/db";
import type { JobApplication } from "@/types/db";

export async function createJobApplication(input: {
  job_posting_id: number;
  full_name: string;
  email: string;
  whatsapp_number?: string;
  linkedin_url?: string;
  cv_file_url: string;
  cover_message?: string;
}): Promise<JobApplication> {
  const rows = await sql`
    INSERT INTO job_applications
      (job_posting_id, full_name, email, whatsapp_number, linkedin_url, cv_file_url, cover_message, status)
    VALUES
      (${input.job_posting_id}, ${input.full_name}, ${input.email},
       ${input.whatsapp_number ?? null}, ${input.linkedin_url ?? null},
       ${input.cv_file_url}, ${input.cover_message ?? null}, 'received')
    RETURNING *
  `;
  return rows[0] as JobApplication;
}

export async function getApplicationsByPosting(postingId: number): Promise<JobApplication[]> {
  const rows = await sql`
    SELECT ja.*, jp.title AS job_title
    FROM job_applications ja
    JOIN job_postings jp ON jp.id = ja.job_posting_id
    WHERE ja.job_posting_id = ${postingId}
    ORDER BY ja.created_at DESC
  `;
  return rows as JobApplication[];
}

export async function getAllApplications(): Promise<JobApplication[]> {
  const rows = await sql`
    SELECT ja.*, jp.title AS job_title
    FROM job_applications ja
    JOIN job_postings jp ON jp.id = ja.job_posting_id
    ORDER BY ja.created_at DESC
  `;
  return rows as JobApplication[];
}
