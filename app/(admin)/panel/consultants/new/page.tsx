import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createConsultant } from "@/lib/actions/consultants";

export default function NewConsultantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/consultants" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tambah Konsultan</h2>
          <p className="text-sm text-slate-500">Daftarkan tenaga profesional baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <form action={createConsultant} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Nama Lengkap & Gelar</label>
              <input type="text" name="full_name" required className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: Dr. Budi Santoso, M.Psi" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Profesi / Peran</label>
              <input type="text" name="role_title" required className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: Psikolog Klinis" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Spesialisasi</label>
              <input type="text" name="specialization" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: Hubungan & Pernikahan" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Sertifikasi (SIPP dll)</label>
              <input type="text" name="certification" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Misal: SIPP Aktif" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Foto Profil</label>
              <input type="url" name="photo_url" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Status</label>
              <select name="status" className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Biodata (HTML)</label>
            <textarea name="bio" rows={5} className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm" placeholder="<p>Lulusan Universitas...</p>" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/panel/consultants" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold">
              Batal
            </Link>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
              Simpan Konsultan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
