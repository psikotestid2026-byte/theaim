import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, User, Briefcase, FileDown, MessageCircle } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function JobApplicationDetailPage({ params }: { params: { id: string } }) {
  const appId = parseInt(params.id, 10);
  if (isNaN(appId)) notFound();

  const applications = await sql`
    SELECT a.*, p.title as posting_title, p.department
    FROM job_applications a
    JOIN job_postings p ON p.id = a.job_posting_id
    WHERE a.id = ${appId}
  `.catch(() => []);

  if (applications.length === 0) notFound();
  const app = applications[0];

  async function updateApplicationStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    
    await sql`
      UPDATE job_applications SET
        status = ${status},
        updated_at = now()
      WHERE id = ${appId}
    `;

    revalidatePath(`/panel/job-applications/${appId}`);
    revalidatePath("/panel/job-applications");
    redirect(`/panel/job-applications/${appId}`);
  }

  const statusColors: any = {
    received: "bg-slate-100 text-slate-700",
    screening: "bg-amber-100 text-amber-700",
    interview: "bg-blue-100 text-blue-700",
    offered: "bg-purple-100 text-purple-700",
    hired: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/job-applications" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{app.applicant_name}</h2>
          <p className="text-sm text-slate-500">Detail lamaran kandidat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Profil Pelamar
          </h3>
          
          <div className="grid grid-cols-2 gap-y-4">
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Posisi Dilamar</p>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <p className="font-semibold text-slate-900">{app.posting_title}</p>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{app.department}</span>
              </div>
            </div>
            <div className="col-span-2 border-t border-slate-100 my-2"></div>
            <div>
              <p className="text-sm text-slate-500">WhatsApp</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-slate-900">{app.whatsapp_number}</p>
                <a href={`https://wa.me/${app.whatsapp_number.replace(/\\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100">
                  <MessageCircle className="w-3 h-3" /> WA
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-slate-900">{app.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">LinkedIn URL</p>
              {app.linkedin_url ? (
                <a href={app.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                  {app.linkedin_url}
                </a>
              ) : (
                <p className="text-slate-500">-</p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Portofolio URL</p>
              {app.portfolio_url ? (
                <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                  {app.portfolio_url}
                </a>
              ) : (
                <p className="text-slate-500">-</p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Tanggal Melamar</p>
              <p className="text-slate-900">{new Date(app.created_at).toLocaleString("id-ID")}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Pesan Pengantar (Cover Letter)</p>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap mt-1">
                {app.cover_message || "Tidak ada pesan pengantar."}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center min-h-[150px]">
            <h3 className="text-lg font-bold text-slate-900 mb-4 self-start">Curriculum Vitae</h3>
            {app.cv_file_url ? (
              <a href={app.cv_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 font-bold transition-colors">
                <FileDown className="w-5 h-5" />
                Unduh Berkas CV
              </a>
            ) : (
              <p className="text-slate-500 text-sm">Pelamar tidak mengunggah CV.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Proses Rekrutmen</h3>
            
            <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Status Saat Ini</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${statusColors[app.status]}`}>
                  {app.status}
                </span>
              </div>
            </div>

            <form action={updateApplicationStatus} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Ubah Tahapan Status</label>
                <select name="status" defaultValue={app.status} className="w-full p-2 border border-slate-200 rounded-lg">
                  <option value="received">Received (Baru Masuk)</option>
                  <option value="screening">Screening (Pemeriksaan Berkas)</option>
                  <option value="interview">Interview (Pemanggilan Tes/Wawancara)</option>
                  <option value="offered">Offered (Penawaran Gaji)</option>
                  <option value="hired">Hired (Diterima)</option>
                  <option value="rejected">Rejected (Ditolak)</option>
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
                  Update Tahapan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
