import { sql } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createTestimonial } from "@/lib/actions/testimonials";

export default async function NewTestimonialPage() {
  const services = await sql`SELECT id, name FROM services ORDER BY name ASC`.catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/testimonials" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tambah Testimoni</h2>
          <p className="text-sm text-slate-500">Buat ulasan baru dari pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <form action={createTestimonial} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Nama Pelanggan</label>
              <input type="text" name="customer_name" required className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: Andi Permana" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Peran / Jabatan</label>
              <input type="text" name="role_label" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: Mahasiswa / CEO PT Maju" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Layanan Terkait</label>
              <select name="related_service_id" className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="">Tidak ada spesifik</option>
                {services.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Rating (1-5)</label>
              <input type="number" name="rating" min="1" max="5" defaultValue="5" className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-900">Isi Testimoni</label>
              <textarea name="content" required rows={4} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Sangat puas dengan layanannya..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Foto Profil</label>
              <input type="url" name="photo_url" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Urutan Tampil (Sort Order)</label>
              <input type="number" name="display_order" defaultValue="0" className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-center border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" name="is_published" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-semibold text-slate-900">Publish Testimoni</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/panel/testimonials" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold">
              Batal
            </Link>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
              Simpan Testimoni
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
