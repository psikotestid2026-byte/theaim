import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ReceiptText, ShieldCheck, XCircle } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function PaymentDetailPage({ params }: { params: { id: string } }) {
  const payId = parseInt(params.id, 10);
  if (isNaN(payId)) notFound();

  const payments = await sql`
    SELECT p.*, r.registration_code, r.customer_id, c.full_name as customer_name,
           m.name as method_name, m.provider, au.full_name as confirmed_by_name
    FROM payments p
    JOIN registrations r ON r.id = p.registration_id
    JOIN customers c ON c.id = r.customer_id
    LEFT JOIN payment_methods m ON m.id = p.payment_method_id
    LEFT JOIN admin_users au ON au.id = p.confirmed_by
    WHERE p.id = ${payId}
  `.catch(() => []);

  if (payments.length === 0) notFound();
  const payment = payments[0];

  async function confirmPayment() {
    "use server";
    // In a real app, you would get the admin ID from the session (e.g. NextAuth)
    // For now we assume admin ID 1 is confirming
    await sql`
      UPDATE payments SET
        status = 'confirmed',
        confirmed_by = 1,
        confirmed_at = now()
      WHERE id = ${payId}
    `;

    // Also update the registration status
    await sql`
      UPDATE registrations SET status = 'paid' WHERE id = ${payment.registration_id}
    `;
    
    revalidatePath(`/panel/payments/${payId}`);
    revalidatePath("/panel/payments");
    redirect(`/panel/payments/${payId}`);
  }

  async function rejectPayment() {
    "use server";
    await sql`
      UPDATE payments SET status = 'rejected' WHERE id = ${payId}
    `;
    revalidatePath(`/panel/payments/${payId}`);
    revalidatePath("/panel/payments");
    redirect(`/panel/payments/${payId}`);
  }

  const statusColors: any = {
    awaiting_confirmation: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    refunded: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/payments" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{payment.payment_code}</h2>
          <p className="text-sm text-slate-500">Validasi dan detail pembayaran.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-blue-600" />
              Rincian Pembayaran
            </h3>
            
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-slate-500">Registrasi Terkait</p>
                <Link href={`/panel/registrations/${payment.registration_id}`} className="font-semibold text-blue-600 hover:underline">
                  {payment.registration_code}
                </Link>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status Saat Ini</p>
                <span className={`inline-block px-2 py-1 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[payment.status]}`}>
                  {payment.status.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pelanggan</p>
                <Link href={`/panel/customers/${payment.customer_id}`} className="font-medium text-slate-900 hover:underline">
                  {payment.customer_name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-slate-500">Metode Bayar</p>
                <p className="font-medium text-slate-900">{payment.method_name} ({payment.provider})</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nominal Transfer</p>
                <p className="text-slate-900 font-mono font-bold text-lg">Rp {parseInt(payment.amount).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Waktu Dibuat</p>
                <p className="text-slate-900">{new Date(payment.created_at).toLocaleString("id-ID")}</p>
              </div>
            </div>

            {payment.status === 'confirmed' && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">Dikonfirmasi Oleh</p>
                <p className="font-semibold text-slate-900">{payment.confirmed_by_name || "Sistem Otomatis (Webhook)"}</p>
                {payment.confirmed_at && (
                  <p className="text-xs text-slate-500">{new Date(payment.confirmed_at).toLocaleString("id-ID")}</p>
                )}
              </div>
            )}
          </div>

          {payment.status === 'awaiting_confirmation' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Aksi Validasi</h3>
              <p className="text-sm text-slate-500 mb-6">
                Pastikan dana benar-benar sudah masuk ke rekening atau saldo sistem sebelum melakukan konfirmasi. Aksi konfirmasi akan mengubah status registrasi menjadi Paid dan berpotensi mengirimkan Test Token secara otomatis.
              </p>
              
              <div className="flex gap-4">
                <form action={rejectPayment} className="flex-1">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-colors">
                    <XCircle className="w-5 h-5" />
                    Tolak / Tidak Valid
                  </button>
                </form>
                <form action={confirmPayment} className="flex-1">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition-colors shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                    Konfirmasi Uang Masuk
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full min-h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Bukti Pembayaran</h3>
            <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-4">
              {payment.proof_file_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={payment.proof_file_url} alt="Bukti Transfer" className="max-h-[500px] object-contain rounded-lg shadow-sm" />
              ) : (
                <div className="text-center text-slate-500">
                  <p className="mb-2 text-sm font-semibold">Tidak Ada Berkas Terlampir</p>
                  <p className="text-xs">Pembayaran ini menggunakan metode {payment.provider} yang mungkin diverifikasi via sistem secara otomatis (Webhook).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
