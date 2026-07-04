import { sql } from "@/lib/db";
import type { JobPosting } from "@/types/db";

export async function getOpenJobPostings(filters?: {
  department?: string;
  employment_type?: string;
}): Promise<JobPosting[]> {
  if (filters?.department && filters?.employment_type) {
    const rows = await sql`
      SELECT * FROM job_postings
      WHERE status = 'open' AND department = ${filters.department}
        AND employment_type = ${filters.employment_type}
      ORDER BY posted_at DESC NULLS LAST
    `;
    return rows as JobPosting[];
  }
  if (filters?.department) {
    const rows = await sql`
      SELECT * FROM job_postings
      WHERE status = 'open' AND department = ${filters.department}
      ORDER BY posted_at DESC NULLS LAST
    `;
    return rows as JobPosting[];
  }
  const rows = await sql`
    SELECT * FROM job_postings WHERE status = 'open' ORDER BY posted_at DESC NULLS LAST
  `;
  return rows as JobPosting[];
}

export async function getJobPostingBySlug(slug: string): Promise<JobPosting | null> {
  const rows = await sql`
    SELECT * FROM job_postings WHERE slug = ${slug} LIMIT 1
  `;
  return (rows[0] as JobPosting) ?? null;
}

export async function getAllJobPostings(): Promise<JobPosting[]> {
  const rows = await sql`SELECT * FROM job_postings ORDER BY created_at DESC`;
  return rows as JobPosting[];
}

export async function createJobPosting(input: Partial<JobPosting>) {
  const rows = await sql`
    INSERT INTO job_postings (title, slug, department, employment_type, location, description, requirements, status, posted_at)
    VALUES (${input.title}, ${input.slug}, ${input.department}, ${input.employment_type},
            ${input.location ?? "Bandung, Indonesia"}, ${input.description ?? null},
            ${input.requirements ?? null}, ${input.status ?? "open"}, ${input.status === "open" ? new Date() : null})
    RETURNING *
  `;
  return rows[0];
}

export async function countOpenJobs(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM job_postings WHERE status = 'open'`;
  return (rows[0] as { count: number }).count;
}
