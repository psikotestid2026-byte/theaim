import { getAllCustomers } from "@/lib/queries/customers";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers(100, 0).catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Daftar Kustomer"
        description="Semua kustomer yang terdaftar melalui layanan TheAIM."
        data={customers}
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Nama Lengkap", cell: (c) => (
            <span className="font-bold text-slate-900">{c.full_name}</span>
          ) },
          { header: "WhatsApp", cell: (c) => (
            <span className="text-slate-600 font-mono">{c.whatsapp_number}</span>
          ) },
          { header: "Email", cell: (c) => (
            <span className="text-sm text-slate-500">{c.email || "-"}</span>
          ) },
          { header: "Kota", cell: (c) => (
            <span className="text-sm text-slate-700">{c.city || "-"}</span>
          ) },
          { header: "Status", cell: (c) => {
            const isActive = c.status === "active";
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {String(c.status)}
              </span>
            );
          } },
          { header: "Aksi", cell: (c) => (
            <Link href={`/panel/customers/${c.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Detail ↗
            </Link>
          ) },
        ]}
      />
    </div>
  );
}
