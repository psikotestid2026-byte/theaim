import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminJobApplicationsPage() {
  const apps = await sql`
    SELECT ja.*, jp.title as job_title
    FROM job_applications ja
    JOIN job_postings jp ON jp.id = ja.job_posting_id
    ORDER BY ja.created_at DESC
    LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Lamaran Pekerjaan"
        description="Data pelamar untuk lowongan karir."
        data={apps}
        columns={[
          { header: "Tanggal", cell: (a: any) => new Date(a.created_at).toLocaleDateString("id-ID") },
          { header: "Posisi", cell: (a: any) => <span className="font-bold">{a.job_title}</span> },
          { header: "Pelamar", cell: (a: any) => (
            <div>
              <p className="font-medium text-slate-900">{a.full_name}</p>
              <p className="text-[10px] text-slate-500">{a.email}</p>
            </div>
          ) },
          { header: "CV", cell: (a: any) => (
            <a href={a.cv_file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline">Download ↗</a>
          ) },
          { header: "Status", cell: (a: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${a.status === 'received' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
              {a.status}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
