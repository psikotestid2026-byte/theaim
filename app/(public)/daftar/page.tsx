import type { Metadata } from "next";
import { getPublishedServices } from "@/lib/queries/services";
import { getAllPackages } from "@/lib/queries/service-packages";
import RegistrationForm from "@/components/public/RegistrationForm";
import type { ServicePackage } from "@/types/db";

export const metadata: Metadata = {
  title: "Formulir Pendaftaran Layanan",
  description: "Daftarkan diri Anda untuk mendapatkan layanan psikologi, coaching, dan konsultasi dari TheAIM.",
};

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const sp = await searchParams;
  const [services, allPackages] = await Promise.all([
    getPublishedServices(),
    getAllPackages(),
  ]);

  const packagesByService: Record<number, ServicePackage[]> = {};
  for (const pkg of allPackages) {
    if (!packagesByService[pkg.service_id]) packagesByService[pkg.service_id] = [];
    packagesByService[pkg.service_id].push(pkg);
  }

  const preselectedService = sp.service
    ? services.find(s => s.slug === sp.service)
    : undefined;

  return (
    <section className="py-20 px-4 bg-slate-50 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-[620px] w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">📋</div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Formulir Pendaftaran</h1>
            <p className="text-slate-500 font-medium text-sm">
              Silakan lengkapi data diri Anda untuk melanjutkan proses pendaftaran layanan TheAIM.
            </p>
          </div>
          <RegistrationForm
            services={services}
            packagesByService={packagesByService}
            preselectedServiceId={preselectedService?.id}
          />
        </div>
      </div>
    </section>
  );
}
