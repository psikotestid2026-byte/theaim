import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updateEcourse } from "@/lib/actions/ecourse";

export default async function EditEcoursePage({ params }: { params: { id: string } }) {
  const ecourseId = parseInt(params.id, 10);
  if (isNaN(ecourseId)) notFound();

  const modules = await sql`SELECT * FROM ecourse_modules WHERE id = ${ecourseId}`.catch(() => []);
  if (modules.length === 0) notFound();
  const mod = modules[0];

  const updateAction = updateEcourse.bind(null, ecourseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/ecourse-modules" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Edit Modul E-Course</h2>
          <p className="text-sm text-slate-500">Ubah materi video/kursus.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <form action={updateAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-900">Judul Modul</label>
              <input type="text" name="title" defaultValue={mod.title} required className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Hari Ke- (Day Number)</label>
              <input type="number" name="day_number" min="1" defaultValue={mod.day_number} required className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Durasi (Menit)</label>
              <input type="number" name="duration_minutes" min="1" defaultValue={mod.duration_minutes} required className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-900">Deskripsi Modul</label>
              <textarea name="description" defaultValue={mod.description || ""} rows={3} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Video</label>
              <input type="url" name="video_url" defaultValue={mod.video_url || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Materi / Handout (PDF)</label>
              <input type="url" name="material_file_url" defaultValue={mod.material_file_url || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Status</label>
              <select name="status" defaultValue={mod.status} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/panel/ecourse-modules" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold">
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
