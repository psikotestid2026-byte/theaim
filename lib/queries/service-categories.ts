import { sql } from "@/lib/db";
import type { ServiceCategory } from "@/types/db";

export async function getAllServiceCategories(): Promise<ServiceCategory[]> {
  const rows = await sql`
    SELECT * FROM service_categories ORDER BY display_order ASC
  `;
  return rows as ServiceCategory[];
}

export async function getServiceCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  const rows = await sql`
    SELECT * FROM service_categories WHERE slug = ${slug} LIMIT 1
  `;
  return (rows[0] as ServiceCategory) ?? null;
}

export async function createServiceCategory(input: {
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
}) {
  const rows = await sql`
    INSERT INTO service_categories (name, slug, description, display_order)
    VALUES (${input.name}, ${input.slug}, ${input.description ?? null}, ${input.display_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}

export async function updateServiceCategory(
  id: number,
  input: Partial<{ name: string; slug: string; description: string; display_order: number }>
) {
  const rows = await sql`
    UPDATE service_categories
    SET name = COALESCE(${input.name ?? null}, name),
        slug = COALESCE(${input.slug ?? null}, slug),
        description = COALESCE(${input.description ?? null}, description),
        display_order = COALESCE(${input.display_order ?? null}, display_order),
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}
