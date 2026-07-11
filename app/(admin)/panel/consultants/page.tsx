import { getAllConsultants } from "@/lib/queries/consultants";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import Image from "next/image";

export default async function AdminConsultantsPage() {
  const consultants = await getAllConsultants().catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Daftar Konsultan"
        description="Manajemen direktori psikolog, coach, dan terapis."
        data={consultants}
        columns={[
          { header: "Foto", cell: (c) => (
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
              {c.photo_url ? (
                <Image src={c.photo_url} alt={c.full_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-100">
                  {c.full_name.charAt(0)}
                </div>
              )}
            </div>
          ) },
          { header: "Nama & Titel", cell: (c) => (
            <div>
              <p className="font-bold text-slate-900">{c.full_name}</p>
              <p className="text-xs text-slate-500">{c.role_title}</p>
            </div>
          ) },
          { header: "Spesialisasi", cell: (c) => (
            <span className="text-sm text-slate-700">{c.specialization || "-"}</span>
          ) },
          { header: "Sertifikasi", cell: (c) => (
            <span className="text-xs text-slate-500">{c.certification || "-"}</span>
          ) },
          { header: "Status", cell: (c) => {
            const isActive = c.status === "active";
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {String(c.status)}
              </span>
            );
          } },
          { header: "Aksi", cell: (c) => (
            <Link href={`/panel/consultants/${c.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Edit ↗
            </Link>
          ) },
        ]}
        action={
          <button className="btn-primary px-4 py-2 rounded-xl text-sm shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            + Tambah Konsultan
          </button>
        }
      />
    </div>
  );
}
