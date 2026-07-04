import { getAllRegistrations } from "@/lib/queries/registrations";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";

export default async function AdminRegistrationsPage() {
  const registrations = await getAllRegistrations();

  return (
    <div className="space-y-6">
      <DataTable
        title="Daftar Pendaftaran"
        description="Semua data pendaftaran layanan dari kustomer."
        data={registrations}
        columns={[
          { header: "Kode", cell: (r) => <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-xs">{r.registration_code}</span> },
          { header: "Kustomer", cell: (r) => (
            <div>
              <p className="font-bold text-slate-900">{r.full_name}</p>
              <p className="text-xs text-slate-500">{r.whatsapp_number}</p>
            </div>
          ) },
          { header: "Layanan", cell: (r) => (
            <div>
              <p className="font-medium text-slate-900">{r.service_name}</p>
              <p className="text-xs text-slate-500">{r.package_name}</p>
            </div>
          ) },
          { header: "Total", cell: (r) => (
            <span className="font-bold text-slate-700">
              {r.price_quoted ? formatIDR(Number(r.price_quoted)) : "-"}
            </span>
          ) },
          { header: "Status", cell: (r) => {
            const colors: Record<string, string> = {
              pending_confirmation: "bg-yellow-100 text-yellow-700",
              payment_pending: "bg-orange-100 text-orange-700",
              paid: "bg-green-100 text-green-700",
              completed: "bg-blue-100 text-blue-700",
              cancelled: "bg-red-100 text-red-700",
            };
            const color = colors[r.status] || "bg-slate-100 text-slate-700";
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
                {r.status.replace(/_/g, " ")}
              </span>
            );
          } },
          { header: "Aksi", cell: (r) => (
            <Link href={`/status/${r.registration_code}`} target="_blank" className="text-xs font-semibold text-blue-600 hover:underline">
              Lihat Publik ↗
            </Link>
          ) },
        ]}
      />
    </div>
  );
}
