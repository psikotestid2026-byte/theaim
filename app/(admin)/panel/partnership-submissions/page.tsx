import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminPartnershipSubmissionsPage() {
  const submissions = await sql`
    SELECT * FROM partnership_submissions ORDER BY created_at DESC LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Partnership Submissions"
        description="Pengajuan kerjasama dari pihak luar."
        data={submissions}
        columns={[
          { header: "Tanggal", cell: (s: any) => new Date(s.created_at).toLocaleDateString("id-ID") },
          { header: "Instansi", cell: (s: any) => (
            <div>
              <p className="font-bold text-slate-900">{s.organization_name}</p>
              <p className="text-[10px] text-slate-500">{s.collaboration_title}</p>
            </div>
          ) },
          { header: "PIC", cell: (s: any) => (
            <div>
              <p className="text-sm font-medium">{s.pic_full_name}</p>
              <p className="text-xs text-slate-500 font-mono">{s.pic_whatsapp_number}</p>
            </div>
          ) },
          { header: "Status", cell: (s: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === 'approved' ? 'bg-green-100 text-green-700' : s.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {s.status}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
