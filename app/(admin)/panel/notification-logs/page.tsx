import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminNotificationLogsPage() {
  const logs = await sql`
    SELECT nl.*, nt.name as template_name
    FROM notification_logs nl
    LEFT JOIN notification_templates nt ON nt.id = nl.template_id
    ORDER BY nl.created_at DESC
    LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Log Notifikasi"
        description="Riwayat pengiriman notifikasi WhatsApp dan Email."
        data={logs}
        columns={[
          { header: "Waktu", cell: (l: any) => new Date(l.created_at).toLocaleString("id-ID") },
          { header: "Template", cell: (l: any) => (
            <div>
              <p className="font-bold text-slate-900">{l.template_name || "Manual/Custom"}</p>
              <p className="text-[10px] text-slate-500 uppercase">{l.channel}</p>
            </div>
          ) },
          { header: "Penerima", cell: (l: any) => <span className="font-mono text-xs">{l.recipient}</span> },
          { header: "Status", cell: (l: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${l.status === 'sent' ? 'bg-green-100 text-green-700' : l.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {l.status}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
