import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminPaymentLogsPage() {
  const logs = await sql`
    SELECT pl.*, p.payment_code
    FROM payment_logs pl
    LEFT JOIN payments p ON p.id = pl.payment_id
    ORDER BY pl.created_at DESC
    LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Log API Pembayaran (Xendit)"
        description="Catatan webhook dan callback dari payment gateway."
        data={logs}
        columns={[
          { header: "Waktu", cell: (l: any) => new Date(l.created_at).toLocaleString("id-ID") },
          { header: "Tipe", accessorKey: "log_type" },
          { header: "Referensi / Payment", cell: (l: any) => (
            <div>
              <p className="font-mono text-xs">{l.payment_code || "N/A"}</p>
              <p className="text-[10px] text-slate-500">{l.provider_reference}</p>
            </div>
          ) },
          { header: "HTTP Status", cell: (l: any) => (
            <span className={`px-2 py-1 rounded text-xs font-mono ${l.http_status === 200 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
              {l.http_status || "-"}
            </span>
          ) },
          { header: "Endpoint", cell: (l: any) => <span className="text-xs font-mono truncate max-w-[150px] inline-block">{l.endpoint}</span> },
        ]}
      />
    </div>
  );
}
