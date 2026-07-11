import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminServiceConsultantsPage() {
  const mappings = await sql`
    SELECT 
      sc.id, 
      sc.created_at,
      s.name as service_name,
      c.full_name as consultant_name,
      c.role_title
    FROM service_consultants sc
    JOIN services s ON s.id = sc.service_id
    JOIN consultants c ON c.id = sc.consultant_id
    ORDER BY s.name, c.full_name
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Mapping Layanan ↔ Konsultan"
        description="Hubungkan konsultan (psikolog/coach) dengan layanan yang dapat mereka tangani."
        data={mappings}
        columns={[
          { header: "Layanan", cell: (m: any) => (
            <span className="font-bold text-slate-900">{m.service_name}</span>
          ) },
          { header: "Konsultan", cell: (m: any) => (
            <div>
              <p className="font-medium text-slate-900">{m.consultant_name}</p>
              <p className="text-xs text-slate-500">{m.role_title}</p>
            </div>
          ) },
          { header: "Linked Since", cell: (m: any) => (
            <span className="text-sm text-slate-500">
              {new Date(m.created_at).toLocaleDateString("id-ID")}
            </span>
          ) },
          { header: "Aksi", cell: (m: any) => (
            <button className="text-xs font-semibold text-red-600 hover:underline">
              Hapus Link ✕
            </button>
          ) },
        ]}
        action={
          <button className="btn-primary px-4 py-2 rounded-xl text-sm shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            + Tambah Mapping
          </button>
        }
      />
    </div>
  );
}
