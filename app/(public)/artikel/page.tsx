import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/queries/articles";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Artikel & Insights | TheAIM",
  description: "Kumpulan artikel seputar psikologi, HR, dan pengembangan diri.",
};

export default async function ArtikelPage() {
  const articles = await getPublishedArticles().catch(() => []);

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
            Insights
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Artikel & Publikasi
          </h1>
          <p className="text-xl text-slate-500 max-w-[700px] mx-auto leading-relaxed">
            Temukan wawasan terbaru seputar kesehatan mental, karir, dan dinamika sumber daya manusia.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-4xl mb-4">📰</p>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Artikel</h2>
            <p className="text-slate-500 text-sm">Nantikan artikel terbaru dari tim ahli TheAIM segera hadir di sini.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <div key={article.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
                <div className="aspect-[16/10] bg-slate-200 relative">
                  {article.cover_image_url ? (
                    <Image src={article.cover_image_url} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 uppercase tracking-widest">
                    {article.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1">{article.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{article.author_name}</span>
                    <Link href={`/artikel/${article.slug}`} className="text-red-600 font-bold text-sm hover:underline">
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
