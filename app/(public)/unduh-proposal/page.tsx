import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unduh Proposal B2B | TheAIM",
  description: "Dapatkan proposal layanan korporat TheAIM.",
};

export default function UnduhProposalPage() {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[800px] mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">📄</div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Unduh Proposal Korporat</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Silakan lengkapi data diri Anda untuk mengunduh proposal layanan B2B TheAIM. Tautan unduhan akan muncul setelah form dikirimkan.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="form-label">Nama Lengkap PIC</label>
              <input type="text" className="form-input" placeholder="Nama Anda" />
            </div>
            <div>
              <label className="form-label">Nama Perusahaan / Instansi</label>
              <input type="text" className="form-input" placeholder="PT Contoh" />
            </div>
            <div>
              <label className="form-label">Nomor WhatsApp Aktif</label>
              <input type="tel" className="form-input" placeholder="081234..." />
            </div>
            <button type="button" className="btn-primary w-full py-4 rounded-xl shadow-lg shadow-red-200">
              Dapatkan Link Download →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
