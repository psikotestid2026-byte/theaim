import DataTable from "@/components/admin/DataTable";

export default function AdminScoringRubricsPage() {
  return (
    <div className="space-y-6">
      <DataTable
        title="Scoring Rubrics"
        description="Konfigurasi meta-scoring untuk setiap instrumen."
        data={[]}
        columns={[
          { header: "Instrumen", accessorKey: "test_code" },
          { header: "Deskripsi", accessorKey: "description" },
          { header: "Aksi", accessorKey: "action" },
        ]}
      />
    </div>
  );
}
