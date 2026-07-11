import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminProposalLeadsPage() {
  const leads = await sql`
    SELECT * FROM proposal_download_leads ORDER BY created_at DESC LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Proposal Leads"
        description="Leads yang masuk dari download proposal perusahaan."
        data={leads}
        columns={[
          { header: "Tanggal", cell: (l: any) => new Date(l.created_at).toLocaleDateString("id-ID") },
          { header: "Nama", cell: (l: any) => (
            <div>
              <p className="font-bold text-slate-900">{l.full_name}</p>
              <p className="text-xs text-slate-500 font-mono">{l.whatsapp_number}</p>
            </div>
          ) },
          { header: "Perusahaan", cell: (l: any) => (
            <div>
              <p className="text-sm font-medium">{l.company_name || "-"}</p>
              <p className="text-[10px] text-slate-500">{l.position || "-"}</p>
            </div>
          ) },
          { header: "Tipe Proposal", cell: (l: any) => (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded capitalize tracking-wide">
              {l.proposal_type.replace(/_/g, " ")}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
