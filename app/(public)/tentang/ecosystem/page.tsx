import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TheAIM Ecosystem | TheAIM",
  description: "Ekosistem layanan dan platform terintegrasi dari TheAIM.",
};

export default function EcosystemPage() {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
            Ekosistem Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            TheAIM Ecosystem
          </h1>
          <p className="text-xl text-slate-500 max-w-[700px] mx-auto leading-relaxed">
            Berbagai lini inisiatif strategis yang kami kembangkan untuk menjangkau dampak yang lebih luas ke seluruh lapisan masyarakat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">🎓</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">EduAIM</h3>
            <p className="text-slate-600 leading-relaxed">Fokus pada layanan edukasi, beasiswa, dan pengembangan kurikulum sekolah serta bimbingan masuk perguruan tinggi.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6">🌱</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">AIM Foundation</h3>
            <p className="text-slate-600 leading-relaxed">Yayasan non-profit yang mendistribusikan layanan kesehatan mental gratis bagi kalangan yang membutuhkan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
