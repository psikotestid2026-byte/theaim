import { getAllPaymentMethods } from "@/lib/queries/payment-methods";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import Image from "next/image";

export default async function AdminPaymentMethodsPage() {
  const methods = await getAllPaymentMethods().catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Metode Pembayaran"
        description="Manajemen opsi pembayaran yang tersedia saat checkout."
        data={methods}
        columns={[
          { header: "Logo", cell: (m) => (
            <div className="w-16 h-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center">
              {m.logo_url ? (
                <Image src={m.logo_url} alt={m.name} width={50} height={25} className="object-contain max-h-full" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400">NO LOGO</span>
              )}
            </div>
          ) },
          { header: "Nama Metode", cell: (m) => (
            <div>
              <p className="font-bold text-slate-900">{m.name}</p>
              <p className="text-xs text-slate-500 font-mono">Kode: {m.code}</p>
            </div>
          ) },
          { header: "Tipe & Provider", cell: (m) => (
            <div>
              <p className="text-sm text-slate-700 capitalize">{m.channel_type.replace(/_/g, " ")}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase">{m.provider}</p>
            </div>
          ) },
          { header: "Admin Fee", cell: (m) => (
            <span className="text-sm">
              Rp {m.admin_fee_flat} + {m.admin_fee_pct}%
            </span>
          ) },
          { header: "Status", cell: (m) => {
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {m.is_active ? "Aktif" : "Non-Aktif"}
              </span>
            );
          } },
          { header: "Aksi", cell: (m) => (
            <Link href={`/panel/payment-methods/${m.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Edit ↗
            </Link>
          ) },
        ]}
        action={
          <button className="btn-primary px-4 py-2 rounded-xl text-sm shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            + Tambah Metode
          </button>
        }
      />
    </div>
  );
}
