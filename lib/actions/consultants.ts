"use server";

import { sql } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const consultantSchema = z.object({
  full_name: z.string().min(3),
  role_title: z.string().min(3),
  specialization: z.string().optional(),
  certification: z.string().optional(),
  bio: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export async function createConsultant(formData: FormData) {
  const data = {
    full_name: formData.get("full_name") as string,
    role_title: formData.get("role_title") as string,
    specialization: formData.get("specialization") as string,
    certification: formData.get("certification") as string,
    bio: formData.get("bio") as string,
    photo_url: formData.get("photo_url") as string,
    status: formData.get("status") as string,
  };

  const parsed = consultantSchema.parse(data);

  await sql`
    INSERT INTO consultants (
      full_name, role_title, specialization, certification, bio, photo_url, status
    ) VALUES (
      ${parsed.full_name}, ${parsed.role_title}, ${parsed.specialization || null},
      ${parsed.certification || null}, ${parsed.bio || null}, ${parsed.photo_url || null}, 
      ${parsed.status}
    )
  `;

  revalidateTag("consultants");
  revalidatePath("/panel/consultants");
  redirect("/panel/consultants");
}

export async function updateConsultant(id: number, formData: FormData) {
  const data = {
    full_name: formData.get("full_name") as string,
    role_title: formData.get("role_title") as string,
    specialization: formData.get("specialization") as string,
    certification: formData.get("certification") as string,
    bio: formData.get("bio") as string,
    photo_url: formData.get("photo_url") as string,
    status: formData.get("status") as string,
  };

  const parsed = consultantSchema.parse(data);

  await sql`
    UPDATE consultants SET
      full_name = ${parsed.full_name},
      role_title = ${parsed.role_title},
      specialization = ${parsed.specialization || null},
      certification = ${parsed.certification || null},
      bio = ${parsed.bio || null},
      photo_url = ${parsed.photo_url || null},
      status = ${parsed.status},
      updated_at = now()
    WHERE id = ${id}
  `;

  revalidateTag("consultants");
  revalidatePath("/panel/consultants");
  redirect("/panel/consultants");
}
