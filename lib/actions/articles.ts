"use server";

import { sql } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(5),
  category: z.string(),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  author_name: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean().default(false),
});

export async function createArticle(formData: FormData) {
  const data = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    category: formData.get("category") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    cover_image_url: formData.get("cover_image_url") as string,
    author_name: formData.get("author_name") as string || "Tim TheAIM",
    status: formData.get("status") as string,
    is_featured: formData.get("is_featured") === "on",
  };

  const parsed = articleSchema.parse(data);

  await sql`
    INSERT INTO articles (
      title, slug, category, excerpt, content, cover_image_url, 
      author_name, status, is_featured, published_at
    ) VALUES (
      ${parsed.title}, ${parsed.slug}, ${parsed.category}, ${parsed.excerpt || null}, 
      ${parsed.content}, ${parsed.cover_image_url || null}, ${parsed.author_name}, 
      ${parsed.status}, ${parsed.is_featured},
      ${parsed.status === 'published' ? new Date() : null}
    )
  `;

  revalidateTag("articles");
  revalidatePath("/panel/articles");
  redirect("/panel/articles");
}

export async function updateArticle(id: number, formData: FormData) {
  const data = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    category: formData.get("category") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    cover_image_url: formData.get("cover_image_url") as string,
    author_name: formData.get("author_name") as string || "Tim TheAIM",
    status: formData.get("status") as string,
    is_featured: formData.get("is_featured") === "on",
  };

  const parsed = articleSchema.parse(data);

  await sql`
    UPDATE articles SET
      title = ${parsed.title},
      slug = ${parsed.slug},
      category = ${parsed.category},
      excerpt = ${parsed.excerpt || null},
      content = ${parsed.content},
      cover_image_url = ${parsed.cover_image_url || null},
      author_name = ${parsed.author_name},
      status = ${parsed.status},
      is_featured = ${parsed.is_featured},
      published_at = CASE 
        WHEN status != 'published' AND ${parsed.status} = 'published' THEN now()
        ELSE published_at
      END,
      updated_at = now()
    WHERE id = ${id}
  `;

  revalidateTag("articles");
  revalidatePath("/panel/articles");
  redirect("/panel/articles");
}
