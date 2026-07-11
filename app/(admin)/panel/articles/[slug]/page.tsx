import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updateArticle } from "@/lib/actions/articles";

export default async function EditArticlePage({ params }: { params: { slug: string } }) {
  const articles = await sql`SELECT * FROM articles WHERE slug = ${params.slug}`.catch(() => []);

  if (articles.length === 0) notFound();
  const article = articles[0];

  const updateAction = updateArticle.bind(null, article.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/articles" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Edit Artikel</h2>
          <p className="text-sm text-slate-500">Ubah artikel blog.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl">
        <form action={updateAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Judul Artikel</label>
                <input type="text" name="title" defaultValue={article.title} required className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Slug URL</label>
                <input type="text" name="slug" defaultValue={article.slug} required className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Kategori</label>
                <select name="category" defaultValue={article.category} required className="w-full p-2 border border-slate-200 rounded-lg">
                  <option value="Kesehatan Mental">Kesehatan Mental</option>
                  <option value="Dunia Kerja">Dunia Kerja</option>
                  <option value="Pengembangan Diri">Pengembangan Diri</option>
                  <option value="Parenting">Parenting</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Nama Penulis</label>
                <input type="text" name="author_name" defaultValue={article.author_name} required className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">URL Gambar Cover</label>
                <input type="url" name="cover_image_url" defaultValue={article.cover_image_url || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Status</label>
                <select name="status" defaultValue={article.status} className="w-full p-2 border border-slate-200 rounded-lg">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Kutipan Singkat (Excerpt)</label>
            <textarea name="excerpt" defaultValue={article.excerpt || ""} maxLength={255} rows={2} className="w-full p-2 border border-slate-200 rounded-lg" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Konten HTML</label>
            <textarea name="content" defaultValue={article.content} required rows={10} className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm" />
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" name="is_featured" defaultChecked={article.is_featured} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-semibold text-slate-900">Artikel Pilihan (Featured)</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/panel/articles" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold">
              Batal
            </Link>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
