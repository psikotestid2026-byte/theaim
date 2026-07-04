import { getRegistrationByCode } from "@/lib/queries/registrations";
import { getPaymentByRegistration } from "@/lib/queries/payments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";

export default async function RegistrationStatusPage({ params }: { params: Promise<{ registrationCode: string }> }) {
  const { registrationCode } = await params;
  const registration = await getRegistrationByCode(registrationCode).catch(() => null);
  
  if (!registration) return notFound();

  const payment = await getPaymentByRegistration(registration.id).catch(() => null);

  return (
    <section className="py-20 px-4 bg-slate-50 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-[600px] w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Status Pendaftaran</h1>
          <p className="text-slate-500 text-sm">Kode: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{registration.registration_code}</span></p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-semibold text-slate-500">Nama Lengkap</span>
            <span className="text-sm font-bold text-slate-900">{registration.full_name}</span>
          </div>
          <div className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-semibold text-slate-500">Layanan</span>
            <span className="text-sm font-bold text-slate-900">{registration.service_name}</span>
          </div>
          <div className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-semibold text-slate-500">Status Pendaftaran</span>
            <span className="text-sm font-bold capitalize text-slate-900">
              {registration.status.replace(/_/g, " ")}
            </span>
          </div>
          {payment && (
            <div className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-semibold text-slate-500">Status Pembayaran</span>
              <span className="text-sm font-bold capitalize text-slate-900">
                {payment.status.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {registration.status === "payment_pending" && (
            <Link href={`/pembayaran/${registration.registration_code}`} className="flex-1 btn-primary py-3 rounded-xl text-center text-sm">
              Lanjutkan Pembayaran →
            </Link>
          )}
          <a href="https://wa.me/6281999554599" target="_blank" rel="noopener noreferrer" className="flex-1 btn-outline py-3 rounded-xl text-center text-sm">
            Hubungi Admin
          </a>
        </div>
      </div>
    </section>
  );
}
