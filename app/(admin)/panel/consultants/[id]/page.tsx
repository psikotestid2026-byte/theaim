import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updateConsultant } from "@/lib/actions/consultants";

export default async function EditConsultantPage({ params }: { params: { id: string } }) {
  const consultantId = parseInt(params.id, 10);
  if (isNaN(consultantId)) notFound();

  const consultants = await sql`SELECT * FROM consultants WHERE id = ${consultantId}`.catch(() => []);
  if (consultants.length === 0) notFound();
  const consultant = consultants[0];

  const updateAction = updateConsultant.bind(null, consultantId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/consultants" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Edit Konsultan</h2>
          <p className="text-sm text-slate-500">Ubah profil tenaga profesional.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
        <form action={updateAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Nama Lengkap & Gelar</label>
              <input type="text" name="full_name" defaultValue={consultant.full_name} required className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Profesi / Peran</label>
              <input type="text" name="role_title" defaultValue={consultant.role_title} required className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Spesialisasi</label>
              <input type="text" name="specialization" defaultValue={consultant.specialization || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Sertifikasi</label>
              <input type="text" name="certification" defaultValue={consultant.certification || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">URL Foto Profil</label>
              <input type="url" name="photo_url" defaultValue={consultant.photo_url || ""} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Status</label>
              <select name="status" defaultValue={consultant.status} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Biodata (HTML)</label>
            <textarea name="bio" defaultValue={consultant.bio || ""} rows={5} className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/panel/consultants" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold">
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
