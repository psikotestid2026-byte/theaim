import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminTestItemsPage() {
  const items = await sql`
    SELECT * FROM test_items ORDER BY test_code, item_order ASC LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Bank Soal (Test Items)"
        description="Kelola item soal untuk setiap instrumen psikotes."
        data={items}
        columns={[
          { header: "Instrumen", cell: (i: any) => <span className="font-bold">{i.test_code}</span> },
          { header: "Seksi", accessorKey: "section" },
          { header: "No", accessorKey: "item_order" },
          { header: "Pertanyaan", cell: (i: any) => <span className="text-sm line-clamp-2" title={i.question_text}>{i.question_text}</span> },
          { header: "Aksi", cell: () => <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Edit ↗</span> },
        ]}
      />
    </div>
  );
}
