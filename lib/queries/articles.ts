import { sql } from "@/lib/db";
import type { Article } from "@/types/db";

export async function getPublishedArticles(limit = 20, offset = 0): Promise<Article[]> {
  const rows = await sql`
    SELECT * FROM articles WHERE status = 'published'
    ORDER BY published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as Article[];
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const rows = await sql`
    SELECT * FROM articles WHERE status = 'published' AND is_featured = true
    ORDER BY published_at DESC LIMIT 1
  `;
  return (rows[0] as Article) ?? null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const rows = await sql`
    SELECT * FROM articles WHERE slug = ${slug} AND status = 'published' LIMIT 1
  `;
  return (rows[0] as Article) ?? null;
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const rows = await sql`
    SELECT * FROM articles WHERE category = ${category} AND status = 'published'
    ORDER BY published_at DESC
  `;
  return rows as Article[];
}

export async function getAllArticles(): Promise<Article[]> {
  const rows = await sql`SELECT * FROM articles ORDER BY created_at DESC`;
  return rows as Article[];
}

export async function createArticle(input: Partial<Article>) {
  const rows = await sql`
    INSERT INTO articles (title, slug, category, excerpt, content, cover_image_url, author_name, reading_time_minutes, is_featured, status, published_at)
    VALUES (${input.title}, ${input.slug}, ${input.category}, ${input.excerpt ?? null},
            ${input.content}, ${input.cover_image_url ?? null}, ${input.author_name ?? "Tim TheAIM"},
            ${input.reading_time_minutes ?? null}, ${input.is_featured ?? false},
            ${input.status ?? "draft"}, ${input.published_at ?? null})
    RETURNING *
  `;
  return rows[0];
}
