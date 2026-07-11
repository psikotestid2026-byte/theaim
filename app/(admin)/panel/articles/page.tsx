import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminArticlesPage() {
  const articles = await sql`
    SELECT * FROM articles ORDER BY created_at DESC LIMIT 100
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Artikel & Blog"
        description="Manajemen konten artikel TheAIM."
        data={articles}
        columns={[
          { header: "Judul", cell: (a: any) => (
            <div>
              <p className="font-bold text-slate-900 line-clamp-1">{a.title}</p>
              <p className="text-[10px] text-slate-500 uppercase">{a.category}</p>
            </div>
          ) },
          { header: "Status", cell: (a: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {a.status}
            </span>
          ) },
          { header: "Aksi", cell: () => <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Edit ↗</span> },
        ]}
      />
    </div>
  );
}
