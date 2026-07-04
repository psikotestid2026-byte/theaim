import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/queries/articles";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  
  if (!article) return { title: "Artikel Tidak Ditemukan | TheAIM" };
  
  return {
    title: `${article.title} | TheAIM`,
    description: article.excerpt,
  };
}

export default async function ArtikelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);

  if (!article) return notFound();

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[800px] mx-auto px-4">
        
        <Link href="/artikel" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-red-600 mb-8 transition-colors">
          ← Kembali ke Artikel
        </Link>

        <div className="mb-8">
          <span className="inline-block bg-red-100 text-red-600 font-bold uppercase tracking-widest text-xs px-3 py-1.5 rounded-full mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-lg">✍️</div>
              <span>{article.author_name}</span>
            </div>
            <span>•</span>
            <span>{new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

      </div>

      {article.cover_image_url && (
        <div className="max-w-[1000px] mx-auto px-4 mb-12">
          <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-200">
            <Image 
              src={article.cover_image_url} 
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1000px) 100vw, 1000px"
              priority
            />
          </div>
        </div>
      )}

      <div className="max-w-[800px] mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <article className="prose prose-slate md:prose-lg max-w-none prose-headings:font-bold prose-a:text-red-600 prose-img:rounded-2xl" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </div>
  );
}
