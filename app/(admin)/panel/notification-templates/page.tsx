import { getAllTemplates } from "@/lib/queries/notification-templates";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminNotificationTemplatesPage() {
  const templates = await getAllTemplates().catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Template Notifikasi"
        description="Kelola template pesan otomatis WhatsApp/Email untuk berbagai event (pendaftaran, pembayaran, dsb)."
        data={templates}
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Nama Template", cell: (t) => (
            <div>
              <p className="font-bold text-slate-900">{t.name}</p>
              <p className="text-xs text-slate-500 font-mono">Event: {t.event_trigger}</p>
            </div>
          ) },
          { header: "Kanal", cell: (t) => (
            <span className="text-sm font-semibold capitalize text-blue-700 bg-blue-50 px-2 py-1 rounded">
              {t.channel}
            </span>
          ) },
          { header: "Status", cell: (t) => {
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {t.is_active ? "Aktif" : "Non-Aktif"}
              </span>
            );
          } },
          { header: "Aksi", cell: (t) => (
            <Link href={`/panel/notification-templates/${t.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Edit ↗
            </Link>
          ) },
        ]}
        action={
          <button className="btn-primary px-4 py-2 rounded-xl text-sm shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            + Tambah Template
          </button>
        }
      />
    </div>
  );
}
