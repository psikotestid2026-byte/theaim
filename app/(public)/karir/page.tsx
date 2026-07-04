import type { Metadata } from "next";
import Link from "next/link";
import { getOpenJobPostings } from "@/lib/queries/job-postings";

export const metadata: Metadata = {
  title: "Karir & Rekrutmen | TheAIM",
  description: "Bergabung bersama tim ahli TheAIM.",
};

export default async function KarirPage() {
  const jobs = await getOpenJobPostings().catch(() => []);

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
            Karir
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Bergabung Bersama Kami
          </h1>
          <p className="text-xl text-slate-500 max-w-[700px] mx-auto leading-relaxed">
            Membangun Indonesia yang lebih berdaya melalui layanan psikologi dan edukasi yang bermakna.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-4xl mb-4">🤝</p>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Lowongan Terbuka</h2>
            <p className="text-slate-500 text-sm">Saat ini belum ada posisi yang sedang kami cari. Pantau terus halaman ini secara berkala!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{job.department}</span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full capitalize">{job.employment_type.replace('_', ' ')}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{job.description}</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    📍 {job.location}
                  </p>
                </div>
                <div className="shrink-0">
                  <Link href={`/karir/${job.slug}`} className="btn-primary px-8 py-3 rounded-xl w-full text-center">
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
