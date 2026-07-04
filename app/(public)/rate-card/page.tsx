import type { Metadata } from "next";
import { getAllPackages } from "@/lib/queries/service-packages";
import { formatIDR } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rate Card & Biaya Layanan | TheAIM",
  description: "Daftar harga dan investasi untuk seluruh layanan TheAIM.",
};

export default async function RateCardPage() {
  const packages = await getAllPackages().catch(() => []);

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
            Investasi
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Daftar Biaya Layanan (Rate Card)
          </h1>
          <p className="text-xl text-slate-500 max-w-[700px] mx-auto leading-relaxed">
            Transparansi biaya adalah komitmen kami. Berikut adalah rincian biaya untuk layanan psikologi dan pengembangan SDM.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{pkg.service_name}</p>
              <h2 className="text-xl font-bold text-slate-900 mb-4">{pkg.name}</h2>
              <div className="mb-6 pb-6 border-b border-slate-100">
                {pkg.price_type === 'fixed' && pkg.price_amount ? (
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-red-600">{formatIDR(Number(pkg.price_amount))}</span>
                    <span className="text-sm text-slate-500 font-medium mb-1">/ {pkg.price_unit.replace('per_', '')}</span>
                  </div>
                ) : (
                  <div className="text-xl font-black text-red-600">Hubungi Admin</div>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="text-green-500 font-bold shrink-0">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href={`/daftar?package=${pkg.id}`} className="block text-center btn-outline w-full py-3 rounded-xl text-sm">
                Pilih Paket
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
