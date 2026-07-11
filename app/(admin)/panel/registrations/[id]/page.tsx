import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, FileText, CheckCircle } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function RegistrationDetailPage({ params }: { params: { id: string } }) {
  const regId = parseInt(params.id, 10);
  if (isNaN(regId)) notFound();

  const registrations = await sql`
    SELECT r.*, c.full_name as customer_name, c.whatsapp_number as customer_wa,
           s.name as service_name, p.name as package_name,
           cons.full_name as consultant_name
    FROM registrations r
    JOIN customers c ON c.id = r.customer_id
    JOIN services s ON s.id = r.service_id
    LEFT JOIN service_packages p ON p.id = r.package_id
    LEFT JOIN consultants cons ON cons.id = r.consultant_id
    WHERE r.id = ${regId}
  `.catch(() => []);

  if (registrations.length === 0) notFound();
  const reg = registrations[0];

  const payments = await sql`
    SELECT p.*, m.name as method_name
    FROM payments p
    LEFT JOIN payment_methods m ON m.id = p.payment_method_id
    WHERE p.registration_id = ${regId}
  `.catch(() => []);

  const consultants = await sql`
    SELECT c.id, c.full_name 
    FROM consultants c
    JOIN service_consultants sc ON sc.consultant_id = c.id
    WHERE sc.service_id = ${reg.service_id}
  `.catch(() => []);

  async function updateRegistration(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    const consultant_id = formData.get("consultant_id") as string;
    const scheduled_at = formData.get("scheduled_at") as string;
    const price_quoted = formData.get("price_quoted") as string;

    await sql`
      UPDATE registrations SET
        status = ${status},
        consultant_id = ${consultant_id ? parseInt(consultant_id, 10) : null},
        scheduled_at = ${scheduled_at ? new Date(scheduled_at) : null},
        price_quoted = ${price_quoted || reg.price_quoted}
      WHERE id = ${regId}
    `;
    
    revalidatePath(`/panel/registrations/${regId}`);
    revalidatePath("/panel/registrations");
  }

  const statusColors: any = {
    pending_confirmation: "bg-amber-100 text-amber-700",
    schedule_confirmed: "bg-blue-100 text-blue-700",
    payment_pending: "bg-orange-100 text-orange-700",
    paid: "bg-emerald-100 text-emerald-700",
    completed: "bg-teal-100 text-teal-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/registrations" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{reg.registration_code}</h2>
          <p className="text-sm text-slate-500">Detail pendaftaran layanan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Informasi Registrasi
            </h3>
            
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-slate-500">Pelanggan</p>
                <Link href={`/panel/customers/${reg.customer_id}`} className="font-semibold text-blue-600 hover:underline">
                  {reg.customer_name}
                </Link>
                <p className="text-xs text-slate-500 font-mono">{reg.customer_wa}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status Saat Ini</p>
                <span className={`inline-block px-2 py-1 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[reg.status]}`}>
                  {reg.status.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Layanan</p>
                <p className="font-medium text-slate-900">{reg.service_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Paket</p>
                <p className="font-medium text-slate-900">{reg.package_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tanggal Dibuat</p>
                <p className="text-slate-900">{new Date(reg.created_at).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Harga Disepakati</p>
                <p className="text-slate-900 font-mono font-bold">Rp {parseInt(reg.price_quoted || "0").toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Update Status & Jadwal
            </h3>
            
            <form action={updateRegistration} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Ubah Status</label>
                  <select name="status" defaultValue={reg.status} className="w-full p-2 border border-slate-200 rounded-lg">
                    <option value="pending_confirmation">Pending Confirmation</option>
                    <option value="schedule_confirmed">Schedule Confirmed</option>
                    <option value="payment_pending">Payment Pending</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Konsultan</label>
                  <select name="consultant_id" defaultValue={reg.consultant_id || ""} className="w-full p-2 border border-slate-200 rounded-lg">
                    <option value="">Belum Ditugaskan</option>
                    {consultants.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Jadwal (Opsional)</label>
                  <input type="datetime-local" name="scheduled_at" defaultValue={reg.scheduled_at ? new Date(reg.scheduled_at).toISOString().slice(0, 16) : ""} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Penyesuaian Harga</label>
                  <input type="number" name="price_quoted" defaultValue={reg.price_quoted} className="w-full p-2 border border-slate-200 rounded-lg font-mono" />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
                  Update Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Terkait Pembayaran
            </h3>
            
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada upaya pembayaran.</p>
            ) : (
              <div className="space-y-4">
                {payments.map((p: any) => (
                  <div key={p.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl">
                    <p className="text-xs font-mono text-slate-500 mb-1">{p.payment_code}</p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-slate-900">Rp {parseInt(p.amount).toLocaleString("id-ID")}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'confirmed' ? 'bg-green-200 text-green-800' : p.status === 'awaiting_confirmation' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Metode: {p.method_name}</p>
                    
                    <div className="mt-3">
                      <Link href={`/panel/payments/${p.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                        Lihat Detail Pembayaran ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
