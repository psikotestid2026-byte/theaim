"use server";

import { sql } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const testimonialSchema = z.object({
  customer_name: z.string().min(3),
  role_label: z.string().optional(),
  related_service_id: z.string().transform(val => val ? parseInt(val, 10) : null).nullable(),
  content: z.string().min(10),
  rating: z.string().transform(val => val ? parseInt(val, 10) : null).nullable(),
  photo_url: z.string().url().optional().or(z.literal("")),
  is_published: z.boolean().default(true),
  display_order: z.string().transform(val => parseInt(val, 10)).default("0"),
});

export async function createTestimonial(formData: FormData) {
  const data = {
    customer_name: formData.get("customer_name") as string,
    role_label: formData.get("role_label") as string,
    related_service_id: formData.get("related_service_id") as string,
    content: formData.get("content") as string,
    rating: formData.get("rating") as string,
    photo_url: formData.get("photo_url") as string,
    is_published: formData.get("is_published") === "on",
    display_order: formData.get("display_order") as string || "0",
  };

  const parsed = testimonialSchema.parse(data);

  await sql`
    INSERT INTO testimonials (
      customer_name, role_label, related_service_id, content, 
      rating, photo_url, is_published, display_order
    ) VALUES (
      ${parsed.customer_name}, ${parsed.role_label || null}, ${parsed.related_service_id},
      ${parsed.content}, ${parsed.rating}, ${parsed.photo_url || null}, 
      ${parsed.is_published}, ${parsed.display_order}
    )
  `;

  revalidateTag("testimonials");
  revalidatePath("/panel/testimonials");
  redirect("/panel/testimonials");
}

export async function updateTestimonial(id: number, formData: FormData) {
  const data = {
    customer_name: formData.get("customer_name") as string,
    role_label: formData.get("role_label") as string,
    related_service_id: formData.get("related_service_id") as string,
    content: formData.get("content") as string,
    rating: formData.get("rating") as string,
    photo_url: formData.get("photo_url") as string,
    is_published: formData.get("is_published") === "on",
    display_order: formData.get("display_order") as string || "0",
  };

  const parsed = testimonialSchema.parse(data);

  await sql`
    UPDATE testimonials SET
      customer_name = ${parsed.customer_name},
      role_label = ${parsed.role_label || null},
      related_service_id = ${parsed.related_service_id},
      content = ${parsed.content},
      rating = ${parsed.rating},
      photo_url = ${parsed.photo_url || null},
      is_published = ${parsed.is_published},
      display_order = ${parsed.display_order},
      updated_at = now()
    WHERE id = ${id}
  `;

  revalidateTag("testimonials");
  revalidatePath("/panel/testimonials");
  redirect("/panel/testimonials");
}
