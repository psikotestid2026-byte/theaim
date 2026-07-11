import { getAllPayments } from "@/lib/queries/payments";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const payments = await getAllPayments(100, 0).catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Daftar Pembayaran"
        description="Manajemen verifikasi pembayaran kustomer."
        data={payments}
        columns={[
          { header: "Kode Pembayaran", cell: (p: any) => (
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-xs">{p.payment_code}</span>
          ) },
          { header: "Pendaftaran", cell: (p: any) => (
            <span className="text-xs font-medium text-slate-700">{p.registration_code}</span>
          ) },
          { header: "Metode", cell: (p: any) => (
            <span className="text-sm font-semibold text-slate-900">{p.method_name}</span>
          ) },
          { header: "Nominal", cell: (p: any) => (
            <span className="font-bold text-slate-800">{formatIDR(Number(p.amount))}</span>
          ) },
          { header: "Status", cell: (p: any) => {
            const colors: Record<string, string> = {
              awaiting_confirmation: "bg-yellow-100 text-yellow-700",
              confirmed: "bg-green-100 text-green-700",
              rejected: "bg-red-100 text-red-700",
              refunded: "bg-slate-100 text-slate-700",
            };
            const color = colors[p.status] || "bg-slate-100 text-slate-700";
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
                {p.status.replace(/_/g, " ")}
              </span>
            );
          } },
          { header: "Tanggal", cell: (p: any) => (
            <span className="text-xs text-slate-500">
              {new Date(p.created_at).toLocaleDateString("id-ID")}
            </span>
          ) },
          { header: "Aksi", cell: (p: any) => (
            <Link href={`/panel/payments/${p.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Verifikasi ↗
            </Link>
          ) },
        ]}
      />
    </div>
  );
}
