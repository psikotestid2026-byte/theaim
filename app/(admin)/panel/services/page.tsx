import { getAllServices } from "@/lib/queries/services";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminServicesPage() {
  const services = await getAllServices().catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Daftar Layanan"
        description="Manajemen katalog layanan yang ditampilkan di web publik."
        data={services}
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Layanan", cell: (s) => (
            <div>
              <p className="font-bold text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-500 font-mono">/{s.slug}</p>
            </div>
          ) },
          { header: "Audiens", cell: (s) => (
            <span className="text-sm text-slate-700 capitalize">{String(s.audience_type)}</span>
          ) },
          { header: "Status", cell: (s) => {
            const isActive = s.status === "published";
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {String(s.status)}
              </span>
            );
          } },
          { header: "Unggulan", cell: (s) => (
            s.is_featured ? <span className="text-amber-500">⭐ Ya</span> : <span className="text-slate-300">-</span>
          ) },
          { header: "Aksi", cell: (s) => (
            <div className="flex gap-3">
              <Link href={`/layanan/${s.slug}`} target="_blank" className="text-xs font-semibold text-blue-600 hover:underline">
                Lihat ↗
              </Link>
            </div>
          ) },
        ]}
        action={
          <button className="btn-primary px-4 py-2 rounded-xl text-sm shadow-sm">
            + Tambah Layanan
          </button>
        }
      />
    </div>
  );
}
