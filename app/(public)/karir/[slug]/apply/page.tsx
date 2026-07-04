import { notFound } from "next/navigation";
import { getJobPostingBySlug } from "@/lib/queries/job-postings";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobPostingBySlug(slug).catch(() => null);
  
  if (!job) return { title: "Lowongan Tidak Ditemukan | TheAIM" };
  
  return {
    title: `Lamar: ${job.title} | TheAIM`,
  };
}

export default async function KarirApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobPostingBySlug(slug).catch(() => null);

  if (!job) return notFound();

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[800px] mx-auto px-4">
        
        <Link href={`/karir/${job.slug}`} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-red-600 mb-8 transition-colors">
          ← Batal & Kembali
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="mb-8 pb-8 border-b border-slate-100">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Formulir Lamaran Pekerjaan</h1>
            <p className="text-slate-500 text-sm">Anda sedang melamar untuk posisi: <strong className="text-slate-800">{job.title}</strong></p>
          </div>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Nama Lengkap</label>
                <input type="text" className="form-input" placeholder="Sesuai KTP" />
              </div>
              <div>
                <label className="form-label">Alamat Email</label>
                <input type="email" className="form-input" placeholder="email@contoh.com" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Nomor WhatsApp Aktif</label>
                <input type="tel" className="form-input" placeholder="0812..." />
              </div>
              <div>
                <label className="form-label">Link Portfolio / LinkedIn</label>
                <input type="url" className="form-input" placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="form-label">Unggah CV / Resume (PDF, Max 5MB)</label>
              <input type="file" className="form-input bg-slate-50 cursor-pointer" accept=".pdf" />
            </div>

            <div>
              <label className="form-label">Surat Lamaran (Cover Letter Singkat)</label>
              <textarea className="form-input" rows={5} placeholder="Mengapa Anda cocok untuk posisi ini?"></textarea>
            </div>

            <div className="pt-4">
              <button type="button" className="btn-primary w-full py-4 rounded-xl shadow-lg shadow-red-200 text-base">
                Kirim Lamaran Sekarang →
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
