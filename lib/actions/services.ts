"use server";

import { sql } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const serviceSchema = z.object({
  category_id: z.string().min(1, "Category is required").transform(val => parseInt(val, 10)),
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  short_description: z.string().max(255).optional(),
  description: z.string().optional(),
  delivery_mode: z.enum(["online", "offline", "hybrid"]),
  audience_type: z.enum(["individual", "corporate", "both"]),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean().default(false),
});

export async function createService(formData: FormData) {
  const data = {
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    short_description: formData.get("short_description") as string,
    description: formData.get("description") as string,
    delivery_mode: formData.get("delivery_mode") as string,
    audience_type: formData.get("audience_type") as string,
    status: formData.get("status") as string,
    is_featured: formData.get("is_featured") === "on",
  };

  const parsed = serviceSchema.parse(data);

  await sql`
    INSERT INTO services (
      category_id, name, slug, short_description, description, 
      delivery_mode, audience_type, status, is_featured
    ) VALUES (
      ${parsed.category_id}, ${parsed.name}, ${parsed.slug}, ${parsed.short_description || null},
      ${parsed.description || null}, ${parsed.delivery_mode}, ${parsed.audience_type}, 
      ${parsed.status}, ${parsed.is_featured}
    )
  `;

  revalidateTag("services");
  revalidatePath("/panel/services");
  redirect("/panel/services");
}

export async function updateService(id: number, formData: FormData) {
  const data = {
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    short_description: formData.get("short_description") as string,
    description: formData.get("description") as string,
    delivery_mode: formData.get("delivery_mode") as string,
    audience_type: formData.get("audience_type") as string,
    status: formData.get("status") as string,
    is_featured: formData.get("is_featured") === "on",
  };

  const parsed = serviceSchema.parse(data);

  await sql`
    UPDATE services SET
      category_id = ${parsed.category_id},
      name = ${parsed.name},
      slug = ${parsed.slug},
      short_description = ${parsed.short_description || null},
      description = ${parsed.description || null},
      delivery_mode = ${parsed.delivery_mode},
      audience_type = ${parsed.audience_type},
      status = ${parsed.status},
      is_featured = ${parsed.is_featured},
      updated_at = now()
    WHERE id = ${id}
  `;

  revalidateTag("services");
  revalidatePath("/panel/services");
  redirect("/panel/services");
}
