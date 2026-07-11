import { getAllServiceCategories } from "@/lib/queries/service-categories";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminServiceCategoriesPage() {
  const categories = await getAllServiceCategories().catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Kategori Layanan"
        description="Kelola kategori layanan untuk halaman utama dan rate card."
        data={categories}
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Kategori", cell: (c) => (
            <div>
              <p className="font-bold text-slate-900">{c.name}</p>
              <p className="text-xs text-slate-500 font-mono">/{c.slug}</p>
            </div>
          ) },
          { header: "Urutan Tampil", accessorKey: "display_order" },
          { header: "Aksi", cell: (c) => (
            <div className="flex gap-3">
              <Link href={`/panel/service-categories/${c.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                Edit ↗
              </Link>
            </div>
          ) },
        ]}
        action={
          <button className="btn-primary px-4 py-2 rounded-xl text-sm shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            + Tambah Kategori
          </button>
        }
      />
    </div>
  );
}
