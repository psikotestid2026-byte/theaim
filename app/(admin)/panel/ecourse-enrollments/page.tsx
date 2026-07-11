import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminEcourseEnrollmentsPage() {
  const enrollments = await sql`
    SELECT ee.*, c.full_name as customer_name, c.email, s.name as service_name
    FROM ecourse_enrollments ee
    JOIN customers c ON c.id = ee.customer_id
    JOIN services s ON s.id = ee.service_id
    ORDER BY ee.created_at DESC
    LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="E-Course Enrollments"
        description="Data peserta e-learning."
        data={enrollments}
        columns={[
          { header: "Akses Dimulai", cell: (e: any) => new Date(e.access_granted_at).toLocaleDateString("id-ID") },
          { header: "Peserta", cell: (e: any) => (
            <div>
              <p className="font-bold text-slate-900">{e.customer_name}</p>
              <p className="text-[10px] text-slate-500">{e.email || "-"}</p>
            </div>
          ) },
          { header: "Program E-Course", cell: (e: any) => <span className="text-sm font-medium">{e.service_name}</span> },
          { header: "Progress", cell: (e: any) => (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono">Day {e.progress_day} / 7</span>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${(e.progress_day / 7) * 100}%` }} />
              </div>
            </div>
          ) },
          { header: "Status", cell: (e: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${e.status === 'completed' ? 'bg-green-100 text-green-700' : e.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              {e.status}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
