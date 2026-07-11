import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id, 10);
  if (isNaN(customerId)) notFound();

  // Fetch customer
  const customers = await sql`
    SELECT * FROM customers WHERE id = ${customerId}
  `.catch(() => []);
  
  if (customers.length === 0) notFound();
  const customer = customers[0];

  // Fetch registrations
  const registrations = await sql`
    SELECT r.*, s.name as service_name
    FROM registrations r
    JOIN services s ON s.id = r.service_id
    WHERE r.customer_id = ${customerId}
    ORDER BY r.created_at DESC
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/customers" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Detail Customer</h2>
          <p className="text-sm text-slate-500">Melihat profil dan riwayat aktivitas pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Informasi Profil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-500">Nama Lengkap</p>
            <p className="font-semibold text-slate-900">{customer.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Nomor WhatsApp</p>
            <p className="font-mono text-slate-900">{customer.whatsapp_number}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-slate-900">{customer.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Kota/Domisili</p>
            <p className="text-slate-900">{customer.city || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-bold uppercase tracking-wider ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {customer.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Tanggal Mendaftar</p>
            <p className="text-slate-900">{new Date(customer.created_at).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Riwayat Pendaftaran</h3>
        {registrations.length === 0 ? (
          <p className="text-slate-500 text-sm">Belum ada riwayat pendaftaran.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-600">Kode Registrasi</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Layanan</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Harga</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/panel/registrations/${r.id}`} className="text-blue-600 hover:underline">
                        {r.registration_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold">{r.service_name}</td>
                    <td className="px-4 py-3">Rp {parseInt(r.price_quoted || "0").toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full uppercase">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
