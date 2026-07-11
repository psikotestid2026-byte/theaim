import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updateService } from "@/lib/actions/services";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const serviceId = parseInt(params.id, 10);
  if (isNaN(serviceId)) notFound();

  const [categories, services] = await Promise.all([
    sql`SELECT id, name FROM service_categories ORDER BY display_order ASC`.catch(() => []),
    sql`SELECT * FROM services WHERE id = ${serviceId}`.catch(() => [])
  ]);

  if (services.length === 0) notFound();
  const service = services[0];

  // Using bind to pass the ID to the server action
  const updateAction = updateService.bind(null, serviceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/services" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Edit Layanan</h2>
          <p className="text-sm text-slate-500">Ubah detail katalog layanan.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <form action={updateAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Kategori</label>
            <select name="category_id" defaultValue={service.category_id} required className="w-full p-2 border border-slate-200 rounded-lg">
              <option value="">Pilih Kategori...</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Nama Layanan</label>
            <input type="text" name="name" defaultValue={service.name} required className="w-full p-2 border border-slate-200 rounded-lg" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Slug URL</label>
            <input type="text" name="slug" defaultValue={service.slug} required className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Deskripsi Singkat</label>
            <textarea name="short_description" defaultValue={service.short_description || ""} maxLength={255} rows={2} className="w-full p-2 border border-slate-200 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Tipe Delivery</label>
              <select name="delivery_mode" defaultValue={service.delivery_mode} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Tipe Audiens</label>
              <select name="audience_type" defaultValue={service.audience_type} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="both">Keduanya</option>
                <option value="individual">Individu</option>
                <option value="corporate">Perusahaan (B2B)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Status</label>
              <select name="status" defaultValue={service.status} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer mt-6">
                <input type="checkbox" name="is_featured" defaultChecked={service.is_featured} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-semibold text-slate-900">Featured Service</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/panel/services" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold">
              Batal
            </Link>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
