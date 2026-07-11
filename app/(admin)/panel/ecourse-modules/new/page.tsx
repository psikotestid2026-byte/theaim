import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createEcourse } from "@/lib/actions/ecourse";

export default function NewEcoursePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/ecourse-modules" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tambah Modul E-Course</h2>
          <p className="text-sm text-slate-500">Buat materi video/kursus baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <form action={createEcourse} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-900">Judul Modul</label>
              <input type="text" name="title" required className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: Pengenalan Dasar Komunikasi" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Hari Ke- (Day Number)</label>
              <input type="number" name="day_number" min="1" required className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: 1" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Durasi (Menit)</label>
              <input type="number" name="duration_minutes" min="1" required className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: 15" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-900">Deskripsi Modul</label>
              <textarea name="description" rows={3} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Pada modul ini kita akan belajar..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Video (YouTube / Vercel Blob)</label>
              <input type="url" name="video_url" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="https://..." />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Materi / Handout (PDF)</label>
              <input type="url" name="material_file_url" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Status</label>
              <select name="status" className="w-full p-2 border border-slate-200 rounded-lg">
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
              Simpan Modul
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
