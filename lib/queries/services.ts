import { sql } from "@/lib/db";
import type { Service } from "@/types/db";

export async function getPublishedServices(): Promise<Service[]> {
  const rows = await sql`
    SELECT s.*, c.name AS category_name
    FROM services s
    JOIN service_categories c ON c.id = s.category_id
    WHERE s.status = 'published'
    ORDER BY c.display_order, s.is_featured DESC, s.name ASC
  `;
  return rows as Service[];
}

export async function getFeaturedServices(): Promise<Service[]> {
  const rows = await sql`
    SELECT s.*, c.name AS category_name
    FROM services s
    JOIN service_categories c ON c.id = s.category_id
    WHERE s.status = 'published' AND s.is_featured = true
    ORDER BY c.display_order, s.name ASC
  `;
  return rows as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const rows = await sql`
    SELECT s.*, c.name AS category_name
    FROM services s
    JOIN service_categories c ON c.id = s.category_id
    WHERE s.slug = ${slug} AND s.status = 'published'
    LIMIT 1
  `;
  return (rows[0] as Service) ?? null;
}

export async function getAllServices(): Promise<Service[]> {
  const rows = await sql`
    SELECT s.*, c.name AS category_name
    FROM services s
    JOIN service_categories c ON c.id = s.category_id
    ORDER BY c.display_order, s.name ASC
  `;
  return rows as Service[];
}

export async function createService(input: {
  category_id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  delivery_mode?: string;
  audience_type?: string;
}) {
  const rows = await sql`
    INSERT INTO services (category_id, name, slug, short_description, description, delivery_mode, audience_type, status)
    VALUES (${input.category_id}, ${input.name}, ${input.slug},
            ${input.short_description ?? null}, ${input.description ?? null},
            ${input.delivery_mode ?? "hybrid"}, ${input.audience_type ?? "individual"}, 'draft')
    RETURNING *
  `;
  return rows[0];
}

export async function updateService(id: number, input: Partial<Service>) {
  const rows = await sql`
    UPDATE services
    SET name = COALESCE(${input.name ?? null}, name),
        slug = COALESCE(${input.slug ?? null}, slug),
        short_description = COALESCE(${input.short_description ?? null}, short_description),
        description = COALESCE(${input.description ?? null}, description),
        status = COALESCE(${input.status ?? null}, status),
        is_featured = COALESCE(${input.is_featured ?? null}, is_featured),
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}
