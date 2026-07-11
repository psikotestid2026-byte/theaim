import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminTestimonialsPage() {
  const testimonials = await sql`
    SELECT t.*, s.name as service_name
    FROM testimonials t
    LEFT JOIN services s ON s.id = t.related_service_id
    ORDER BY t.display_order ASC
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Testimoni"
        description="Manajemen testimoni pelanggan yang tampil di website."
        data={testimonials}
        columns={[
          { header: "Kustomer", cell: (t: any) => (
            <div>
              <p className="font-bold text-slate-900">{t.customer_name}</p>
              <p className="text-[10px] text-slate-500">{t.role_label}</p>
            </div>
          ) },
          { header: "Layanan Terkait", cell: (t: any) => <span className="text-sm font-medium">{t.service_name || "-"}</span> },
          { header: "Rating", cell: (t: any) => <span className="text-amber-500 font-bold">{"⭐".repeat(t.rating || 5)}</span> },
          { header: "Urutan", accessorKey: "display_order" },
          { header: "Status", cell: (t: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {t.is_published ? "Published" : "Hidden"}
            </span>
          ) },
        ]}
      />
    </div>
  );
}
