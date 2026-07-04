import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tentang Kami | TheAIM",
  description: "Mengenal PT Abadi Insan Manfaat lebih dekat.",
};

export default function TentangPage() {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
            Tentang TheAIM
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Visi Kami: Indonesia yang Berdaya
          </h1>
          <p className="text-xl text-slate-500 max-w-[700px] mx-auto leading-relaxed">
            PT Abadi Insan Manfaat hadir untuk memfasilitasi setiap individu dan organisasi mencapai titik optimal mereka melalui pendekatan psikologi yang humanis dan aplikatif.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-xl border border-slate-100 mb-16">
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-red-600">
            <h2>Sejarah Singkat</h2>
            <p>Berawal dari kepedulian mendalam terhadap pengembangan SDM di Indonesia, TheAIM dibangun oleh sekelompok profesional psikologi, asessor, dan pendidik yang berkomitmen untuk memberikan layanan berdampak nyata.</p>
            
            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-xl mt-0">Misi</h3>
                <ul className="mt-2">
                  <li>Memberikan asesmen psikologi yang akurat dan mudah diakses.</li>
                  <li>Menjadi katalisator transformasi bagi perusahaan dan instansi pendidikan.</li>
                  <li>Membangun ekosistem kesehatan mental yang preventif.</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-xl mt-0">Nilai Inti (Core Values)</h3>
                <ul className="mt-2">
                  <li><strong>A</strong>uthenticity (Otentik)</li>
                  <li><strong>I</strong>ntegrity (Integritas)</li>
                  <li><strong>M</strong>astery (Keunggulan)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
