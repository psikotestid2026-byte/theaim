import { getAllTestSessions } from "@/lib/queries/test-sessions";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminTestSessionsPage() {
  const sessions = await getAllTestSessions();

  return (
    <div className="space-y-6">
      <DataTable
        title="Daftar Sesi Tes"
        description="Monitoring sesi psikotes berjalan dan hasil tes."
        data={sessions}
        columns={[
          { header: "Tanggal", cell: (s) => (
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {new Date(s.issued_at).toLocaleDateString("id-ID")}
            </span>
          ) },
          { header: "Kustomer", cell: (s) => (
            <div>
              <p className="font-bold text-slate-900">{s.customer_name}</p>
              <p className="text-xs text-slate-500">{s.whatsapp_number}</p>
            </div>
          ) },
          { header: "Tes", cell: (s) => (
            <div>
              <p className="font-bold text-slate-900">{s.test_code}</p>
              <p className="text-xs text-slate-500">{s.package_name}</p>
            </div>
          ) },
          { header: "Status", cell: (s) => {
            const colors: Record<string, string> = {
              issued: "bg-slate-100 text-slate-700",
              confirming: "bg-blue-100 text-blue-700",
              in_progress: "bg-yellow-100 text-yellow-700",
              completed: "bg-green-100 text-green-700",
              expired: "bg-orange-100 text-orange-700",
              revoked: "bg-red-100 text-red-700",
              locked: "bg-red-600 text-white",
            };
            const color = colors[s.status] || "bg-slate-100 text-slate-700";
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
                {s.status}
              </span>
            );
          } },
          { header: "Hasil", cell: (s) => (
            s.status === "completed" ? (
              <Link href={`/hasil/${s.result_token}`} target="_blank" className="text-xs font-semibold text-blue-600 hover:underline">
                Lihat Hasil ↗
              </Link>
            ) : (
              <span className="text-xs text-slate-400">-</span>
            )
          ) },
        ]}
      />
    </div>
  );
}
