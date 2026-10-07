import DataTable from "@/components/admin/DataTable";
import { listMasterTests } from "@/lib/queries/master-tests";

export const dynamic = "force-dynamic";

export default async function AdminMasterTestsPage() {
  const tests = await listMasterTests().catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Master Tests"
        description="Katalog alat tes. Formula scoring masih draft; bank soal Talents Mapping belum diisi."
        data={tests}
        pageSize={20}
        columns={[
          { header: "Kode", cell: (t) => <span className="font-mono text-xs font-bold">{t.code}</span> },
          { header: "Nama", accessorKey: "name" },
          { header: "Kategori", accessorKey: "category" },
          { header: "Soal", cell: (t) => String(t.total_questions) },
          { header: "Durasi", cell: (t) => `${Math.round(t.duration_sec / 60)} mnt` },
          { header: "Formula", cell: (t) => t.formula_type ?? "—" },
          { header: "Status", cell: (t) => (t.is_active ? "Aktif" : "Nonaktif") },
        ]}
      />
    </div>
  );
}
