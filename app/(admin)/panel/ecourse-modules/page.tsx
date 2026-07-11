import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminEcourseModulesPage() {
  const modules = await sql`
    SELECT em.*, s.name as service_name
    FROM ecourse_modules em
    JOIN services s ON s.id = em.service_id
    ORDER BY s.name, em.day_number ASC
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="E-Course Modules"
        description="Manajemen modul dan materi e-learning."
        data={modules}
        columns={[
          { header: "Program E-Course", cell: (m: any) => <span className="font-bold text-slate-900">{m.service_name}</span> },
          { header: "Hari Ke-", cell: (m: any) => <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">Day {m.day_number}</span> },
          { header: "Judul Modul", accessorKey: "title" },
          { header: "Materi", cell: (m: any) => (
            <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider">
              {m.video_url && <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">Video</span>}
              {m.worksheet_file_url && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Worksheet</span>}
              {m.content_body && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Text</span>}
            </div>
          ) },
          { header: "Aksi", cell: () => <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Edit ↗</span> },
        ]}
      />
    </div>
  );
}
