import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminCorporatePartnersPage() {
  const partners = await sql`
    SELECT * FROM corporate_partners ORDER BY display_order ASC
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Corporate Partners"
        description="Logo mitra dan klien yang tampil di website."
        data={partners}
        columns={[
          { header: "Nama", accessorKey: "name" },
          { header: "Tipe", cell: (p: any) => <span className="capitalize">{p.partnership_type}</span> },
          { header: "Urutan", accessorKey: "display_order" },
          { header: "Status", cell: (p: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {p.status}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
