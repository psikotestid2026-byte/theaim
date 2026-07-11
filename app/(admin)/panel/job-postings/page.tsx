import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminJobPostingsPage() {
  const postings = await sql`
    SELECT * FROM job_postings ORDER BY created_at DESC LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Lowongan Pekerjaan"
        description="Manajemen publikasi lowongan karir."
        data={postings}
        columns={[
          { header: "Posisi", cell: (j: any) => (
            <div>
              <p className="font-bold text-slate-900">{j.title}</p>
              <p className="text-[10px] text-slate-500 uppercase">{j.department} • {j.employment_type}</p>
            </div>
          ) },
          { header: "Lokasi", accessorKey: "location" },
          { header: "Status", cell: (j: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${j.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {j.status}
            </span>
          ) },
          { header: "Aksi", cell: () => <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Edit ↗</span> },
        ]}
      />
    </div>
  );
}
