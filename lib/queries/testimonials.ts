import { sql } from "@/lib/db";
import type { Testimonial } from "@/types/db";

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const rows = await sql`
    SELECT * FROM testimonials WHERE is_published = true
    ORDER BY display_order ASC
  `;
  return rows as Testimonial[];
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const rows = await sql`SELECT * FROM testimonials ORDER BY display_order ASC`;
  return rows as Testimonial[];
}

export async function createTestimonial(input: Partial<Testimonial>) {
  const rows = await sql`
    INSERT INTO testimonials (customer_name, role_label, content, rating, is_published, display_order)
    VALUES (${input.customer_name}, ${input.role_label ?? null}, ${input.content},
            ${input.rating ?? null}, ${input.is_published ?? true}, ${input.display_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}
