import { notFound } from "next/navigation";
import { getJobPostingBySlug } from "@/lib/queries/job-postings";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobPostingBySlug(slug).catch(() => null);
  
  if (!job) return { title: "Lowongan Tidak Ditemukan | TheAIM" };
  
  return {
    title: `Lowongan: ${job.title} | TheAIM`,
    description: job.description,
  };
}

export default async function KarirDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobPostingBySlug(slug).catch(() => null);

  if (!job) return notFound();

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[800px] mx-auto px-4">
        
        <Link href="/karir" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-red-600 mb-8 transition-colors">
          ← Kembali ke Lowongan Pekerjaan
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">{job.department}</span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full capitalize">{job.employment_type.replace('_', ' ')}</span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">📍 {job.location}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
            {job.title}
          </h1>

          <p className="text-lg text-slate-500 mb-8">
            {job.description}
          </p>
          
          <Link href={`/karir/${job.slug}/apply`} className="btn-primary w-full md:w-auto px-10 py-4 rounded-xl text-center shadow-lg shadow-red-200">
            Lamar Posisi Ini Sekarang
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Persyaratan (Requirements)</h2>
            <div className="prose prose-slate prose-li:text-slate-600 prose-ul:list-disc" dangerouslySetInnerHTML={{ __html: job.requirements || "-" }} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Benefit & Kompensasi</h2>
            <div className="prose prose-slate prose-li:text-slate-600 prose-ul:list-disc" dangerouslySetInnerHTML={{ __html: job.benefits || "-" }} />
          </section>
        </div>

      </div>
    </div>
  );
}
