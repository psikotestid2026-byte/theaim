import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Perusahaan & B2B | TheAIM",
  description: "Layanan psikologi, asesmen, dan coaching untuk perusahaan dan instansi.",
};

export default function PerusahaanPage() {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
            B2B & Corporate
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Solusi SDM & Psikologi untuk Perusahaan Anda
          </h1>
          <p className="text-xl text-slate-500 max-w-[700px] mx-auto leading-relaxed">
            Dari rekrutmen hingga pengembangan karyawan, TheAIM menyediakan asesmen dan intervensi psikologis terstandar untuk memaksimalkan potensi tim Anda.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Hubungi Tim B2B Kami</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Nama Lengkap PIC</label>
                <input type="text" className="form-input" placeholder="Nama Anda" />
              </div>
              <div>
                <label className="form-label">Nama Perusahaan / Instansi</label>
                <input type="text" className="form-input" placeholder="PT Contoh" />
              </div>
            </div>
            <div>
              <label className="form-label">Nomor WhatsApp Aktif</label>
              <input type="tel" className="form-input" placeholder="081234..." />
            </div>
            <div>
              <label className="form-label">Kebutuhan / Pesan</label>
              <textarea className="form-input" rows={4} placeholder="Ceritakan kebutuhan perusahaan Anda..."></textarea>
            </div>
            <button type="button" className="btn-primary w-full py-4 rounded-xl shadow-lg shadow-red-200">
              Kirim Permintaan Diskusi →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
