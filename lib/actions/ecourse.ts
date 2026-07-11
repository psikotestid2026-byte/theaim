"use server";

import { sql } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ecourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal("")),
  material_file_url: z.string().url().optional().or(z.literal("")),
  day_number: z.string().transform(val => parseInt(val, 10)),
  duration_minutes: z.string().transform(val => parseInt(val, 10)),
  status: z.enum(["draft", "published", "archived"]),
});

export async function createEcourse(formData: FormData) {
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    video_url: formData.get("video_url") as string,
    material_file_url: formData.get("material_file_url") as string,
    day_number: formData.get("day_number") as string,
    duration_minutes: formData.get("duration_minutes") as string,
    status: formData.get("status") as string,
  };

  const parsed = ecourseSchema.parse(data);

  await sql`
    INSERT INTO ecourse_modules (
      title, description, video_url, material_file_url, 
      day_number, duration_minutes, status
    ) VALUES (
      ${parsed.title}, ${parsed.description || null}, ${parsed.video_url || null}, 
      ${parsed.material_file_url || null}, ${parsed.day_number}, 
      ${parsed.duration_minutes}, ${parsed.status}
    )
  `;

  revalidateTag("ecourse_modules");
  revalidatePath("/panel/ecourse-modules");
  redirect("/panel/ecourse-modules");
}

export async function updateEcourse(id: number, formData: FormData) {
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    video_url: formData.get("video_url") as string,
    material_file_url: formData.get("material_file_url") as string,
    day_number: formData.get("day_number") as string,
    duration_minutes: formData.get("duration_minutes") as string,
    status: formData.get("status") as string,
  };

  const parsed = ecourseSchema.parse(data);

  await sql`
    UPDATE ecourse_modules SET
      title = ${parsed.title},
      description = ${parsed.description || null},
      video_url = ${parsed.video_url || null},
      material_file_url = ${parsed.material_file_url || null},
      day_number = ${parsed.day_number},
      duration_minutes = ${parsed.duration_minutes},
      status = ${parsed.status},
      updated_at = now()
    WHERE id = ${id}
  `;

  revalidateTag("ecourse_modules");
  revalidatePath("/panel/ecourse-modules");
  redirect("/panel/ecourse-modules");
}
