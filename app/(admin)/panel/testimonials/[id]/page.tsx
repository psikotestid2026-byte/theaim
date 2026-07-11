import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updateTestimonial } from "@/lib/actions/testimonials";

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  const testimonialId = parseInt(params.id, 10);
  if (isNaN(testimonialId)) notFound();

  const [services, testimonials] = await Promise.all([
    sql`SELECT id, name FROM services ORDER BY name ASC`.catch(() => []),
    sql`SELECT * FROM testimonials WHERE id = ${testimonialId}`.catch(() => [])
  ]);

  if (testimonials.length === 0) notFound();
  const testimonial = testimonials[0];

  const updateAction = updateTestimonial.bind(null, testimonialId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/testimonials" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Edit Testimoni</h2>
          <p className="text-sm text-slate-500">Ubah ulasan dari pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <form action={updateAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Nama Pelanggan</label>
              <input type="text" name="customer_name" defaultValue={testimonial.customer_name} required className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Peran / Jabatan</label>
              <input type="text" name="role_label" defaultValue={testimonial.role_label || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Layanan Terkait</label>
              <select name="related_service_id" defaultValue={testimonial.related_service_id || ""} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="">Tidak ada spesifik</option>
                {services.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Rating (1-5)</label>
              <input type="number" name="rating" min="1" max="5" defaultValue={testimonial.rating} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-900">Isi Testimoni</label>
              <textarea name="content" defaultValue={testimonial.content} required rows={4} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Foto Profil</label>
              <input type="url" name="photo_url" defaultValue={testimonial.photo_url || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Urutan Tampil (Sort Order)</label>
              <input type="number" name="display_order" defaultValue={testimonial.display_order} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-center border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" name="is_published" defaultChecked={testimonial.is_published} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-semibold text-slate-900">Publish Testimoni</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/panel/testimonials" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold">
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
