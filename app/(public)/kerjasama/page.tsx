import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerjasama & Kolaborasi | TheAIM",
  description: "Buka peluang kerjasama dengan TheAIM.",
};

export default function KerjasamaPage() {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
            Partnership
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Peluang Kolaborasi
          </h1>
          <p className="text-xl text-slate-500 max-w-[700px] mx-auto leading-relaxed">
            Punya visi yang sejalan? Kami terbuka untuk berbagai bentuk kerjasama strategis dengan komunitas, NGO, maupun perusahaan.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 mb-16">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Nama Lengkap PIC</label>
                <input type="text" className="form-input" placeholder="Nama Anda" />
              </div>
              <div>
                <label className="form-label">Nama Organisasi</label>
                <input type="text" className="form-input" placeholder="Nama Komunitas/Instansi" />
              </div>
            </div>
            <div>
              <label className="form-label">Nomor WhatsApp PIC</label>
              <input type="tel" className="form-input" placeholder="081234..." />
            </div>
            <div>
              <label className="form-label">Deskripsi Ide Kolaborasi</label>
              <textarea className="form-input" rows={4} placeholder="Jelaskan bentuk kerjasama yang diharapkan..."></textarea>
            </div>
            <button type="button" className="btn-primary w-full py-4 rounded-xl shadow-lg shadow-red-200">
              Kirim Proposal Kerjasama →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
