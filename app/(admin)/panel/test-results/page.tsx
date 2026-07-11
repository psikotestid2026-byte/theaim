import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminTestResultsPage() {
  const results = await sql`
    SELECT tr.*, ts.access_token, c.full_name as customer_name
    FROM test_results tr
    JOIN test_sessions ts ON ts.id = tr.session_id
    JOIN customers c ON c.id = ts.customer_id
    ORDER BY tr.created_at DESC
    LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Hasil Tes (Test Results)"
        description="Hasil skoring otomatis dari sesi tes yang telah selesai."
        data={results}
        columns={[
          { header: "Waktu", cell: (r: any) => new Date(r.created_at).toLocaleString("id-ID") },
          { header: "Kustomer", cell: (r: any) => <span className="font-bold">{r.customer_name}</span> },
          { header: "Instrumen", accessorKey: "test_code" },
          { header: "Tipe Hasil", cell: (r: any) => (
            <div>
              <p className="font-bold text-slate-900">{r.result_label}</p>
              <p className="text-[10px] text-slate-500 uppercase">{r.result_type}</p>
            </div>
          ) },
          { header: "Aksi", cell: () => <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Lihat Laporan ↗</span> },
        ]}
      />
    </div>
  );
}
