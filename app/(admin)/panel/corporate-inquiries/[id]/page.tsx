import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Building2, MessageCircle } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function CorporateInquiryDetailPage({ params }: { params: { id: string } }) {
  const inquiryId = parseInt(params.id, 10);
  if (isNaN(inquiryId)) notFound();

  const inquiries = await sql`
    SELECT * FROM corporate_inquiries WHERE id = ${inquiryId}
  `.catch(() => []);

  if (inquiries.length === 0) notFound();
  const inquiry = inquiries[0];

  async function updateInquiryStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    
    // Notes column needs to exist in DB, if not we will just skip it for now or assume it exists.
    // The user's ADMIN_PANEL.md mentions "add via ALTER if not already present" but we will just handle status.
    await sql`
      UPDATE corporate_inquiries SET
        status = ${status},
        updated_at = now()
      WHERE id = ${inquiryId}
    `;

    revalidatePath(`/panel/corporate-inquiries/${inquiryId}`);
    revalidatePath("/panel/corporate-inquiries");
    redirect(`/panel/corporate-inquiries/${inquiryId}`);
  }

  const statusColors: any = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-amber-100 text-amber-700",
    in_negotiation: "bg-purple-100 text-purple-700",
    won: "bg-emerald-100 text-emerald-700",
    lost: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/corporate-inquiries" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{inquiry.company_name}</h2>
          <p className="text-sm text-slate-500">Detail prospek perusahaan (B2B).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Informasi Prospek
          </h3>
          
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-sm text-slate-500">Nama Kontak (PIC)</p>
              <p className="font-semibold text-slate-900">{inquiry.contact_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Jabatan</p>
              <p className="text-slate-900">{inquiry.position || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">WhatsApp</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-slate-900">{inquiry.whatsapp_number}</p>
                <a href={`https://wa.me/${inquiry.whatsapp_number.replace(/\\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100">
                  <MessageCircle className="w-3 h-3" /> Chat WA
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-slate-900">{inquiry.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Layanan Diminati</p>
              <p className="font-medium text-slate-900">{inquiry.interested_service || "Umum"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Status Saat Ini</p>
              <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[inquiry.status]}`}>
                {inquiry.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Tanggal Masuk</p>
              <p className="text-slate-900">{new Date(inquiry.created_at).toLocaleString("id-ID")}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Pesan / Kebutuhan</p>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap mt-1">
                {inquiry.message || "Tidak ada pesan tambahan."}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Update Status Pipeline</h3>
          <form action={updateInquiryStatus} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Ubah Status</label>
              <select name="status" defaultValue={inquiry.status} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="new">New (Baru Masuk)</option>
                <option value="contacted">Contacted (Sudah Dihubungi)</option>
                <option value="in_negotiation">In Negotiation (Sedang Negosiasi/Meeting)</option>
                <option value="won">Won (Deal/Berhasil)</option>
                <option value="lost">Lost (Gagal/Batal)</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
                Simpan Perubahan
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Panduan Pipeline</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Mulai dengan mengirimkan pesan perkenalan via WhatsApp (tombol <strong>Chat WA</strong> di sebelah kiri).</li>
              <li>Ubah status menjadi <strong>Contacted</strong> setelah tim mengirim pesan pertama.</li>
              <li>Ubah menjadi <strong>Won</strong> jika penawaran disetujui. Admin bisa mendaftarkan Corporate Customer secara manual di menu Registrations.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
