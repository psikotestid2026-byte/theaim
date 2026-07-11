import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminCorporateInquiriesPage() {
  const inquiries = await sql`
    SELECT * FROM corporate_inquiries ORDER BY created_at DESC LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Corporate Inquiries"
        description="Leads dari perusahaan B2B."
        data={inquiries}
        columns={[
          { header: "Tanggal", cell: (i: any) => new Date(i.created_at).toLocaleDateString("id-ID") },
          { header: "Perusahaan", cell: (i: any) => (
            <div>
              <p className="font-bold text-slate-900">{i.company_name}</p>
              <p className="text-[10px] text-slate-500">{i.full_name} ({i.position})</p>
            </div>
          ) },
          { header: "Layanan Diminati", accessorKey: "interested_service" },
          { header: "WhatsApp", accessorKey: "whatsapp_number" },
          { header: "Status", cell: (i: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${i.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              {i.status}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
