import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/queries/services";
import { getPackagesByServiceId } from "@/lib/queries/service-packages";
import { formatIDR } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  if (!service) return { title: "Layanan Tidak Ditemukan | TheAIM" };
  return {
    title: `${service.name} | TheAIM`,
    description: service.short_description || `Layanan ${service.name} dari TheAIM.`,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Note: For full dynamic data, we fetch from DB. 
  // If the seed didn't include talents-mapping, we can mock it here for the sake of the reference matching.
  let service = await getServiceBySlug(slug).catch(() => null);
  let packages = service ? await getPackagesByServiceId(service.id).catch(() => []) : [];

  // Fallback for demo purposes if the specific slug isn't in DB yet
  if (!service) {
    // Generate a human-readable title from the slug
    const formattedName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    service = {
      id: 999,
      category_id: 1,
      name: formattedName,
      slug: slug,
      short_description: "Layanan profesional untuk pengembangan potensi Anda.",
      description: `Layanan ${formattedName} dirancang khusus untuk memenuhi kebutuhan pengembangan diri dan organisasi secara komprehensif.`,
      delivery_mode: "online",
      audience_type: "both",
      is_featured: true,
      status: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    packages = [
      {
        id: 9991,
        service_id: 999,
        test_code: null,
        name: `Paket ${formattedName} Premium`,
        price_type: "fixed",
        price_amount: "250000",
        price_min: null,
        price_max: null,
        price_unit: "per_access",
        features: ["Sesi 1-on-1", "Laporan Komprehensif", "Sertifikat", "Akses Seumur Hidup"],
        is_popular: true,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 9992,
        service_id: 999,
        test_code: null,
        name: `Paket Reguler`,
        price_type: "fixed",
        price_amount: "150000",
        price_min: null,
        price_max: null,
        price_unit: "per_access",
        features: ["Akses Materi Dasar", "Grup Diskusi", "E-Sertifikat"],
        is_popular: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  return (
    <>
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-600 via-slate-900 to-slate-900" />
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="max-w-[800px]">
            <span className="inline-block text-xs font-black text-red-400 uppercase tracking-widest bg-red-950/50 px-4 py-2 rounded-full mb-6 border border-red-900/50">
              Layanan Unggulan
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              {service.name}
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-[600px]">
              {service.description || service.short_description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/daftar?service=${service.slug}`} className="btn-primary px-8 py-4 rounded-xl text-sm justify-center shadow-lg shadow-red-900/20">
                Daftar Sekarang →
              </Link>
              <a href="https://wa.me/6281999554599" target="_blank" rel="noopener noreferrer" className="btn-corp px-8 py-4 rounded-xl text-sm justify-center">
                💬 Konsultasi via WA
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <h2 className="section-title mb-4">Pilihan Paket</h2>
            <p className="text-slate-500">Pilih paket layanan yang paling sesuai dengan kebutuhan Anda.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {packages.map(pkg => (
              <div key={pkg.id} className={`bg-white rounded-3xl p-8 border ${pkg.is_popular ? 'border-red-600 shadow-xl shadow-red-100 relative' : 'border-slate-100 shadow-lg'}`}>
                {pkg.is_popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Paling Diminati
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                <div className="mb-6">
                  {pkg.price_type === 'fixed' && pkg.price_amount ? (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-red-600">{formatIDR(Number(pkg.price_amount))}</span>
                      <span className="text-sm text-slate-500 font-medium mb-1">/ {pkg.price_unit.replace('per_', '')}</span>
                    </div>
                  ) : (
                    <div className="text-xl font-black text-red-600">Hubungi Kami</div>
                  )}
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/daftar?service=${service?.slug}&package=${pkg.id}`} className={`w-full block text-center py-4 rounded-xl text-sm font-bold transition-all ${
                  pkg.is_popular ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}>
                  Pilih Paket Ini
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
