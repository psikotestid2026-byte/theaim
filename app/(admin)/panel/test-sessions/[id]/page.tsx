import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Key, Lock, Fingerprint, Calendar, Copy, Clock } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function TestSessionDetailPage({ params }: { params: { id: string } }) {
  const sessionId = parseInt(params.id, 10);
  if (isNaN(sessionId)) notFound();

  const sessions = await sql`
    SELECT s.*, r.registration_code, c.full_name as customer_name, c.whatsapp_number
    FROM test_sessions s
    JOIN registrations r ON r.id = s.registration_id
    JOIN customers c ON c.id = s.customer_id
    WHERE s.id = ${sessionId}
  `.catch(() => []);

  if (sessions.length === 0) notFound();
  const session = sessions[0];

  async function revokeSession() {
    "use server";
    await sql`
      UPDATE test_sessions SET
        status = 'revoked',
        updated_at = now()
      WHERE id = ${sessionId}
    `;
    // In a real app, delete Redis cache here as well.
    revalidatePath(`/panel/test-sessions/${sessionId}`);
    revalidatePath("/panel/test-sessions");
    redirect(`/panel/test-sessions/${sessionId}`);
  }

  const statusColors: any = {
    issued: "bg-slate-100 text-slate-700",
    confirming: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    locked: "bg-red-100 text-red-700",
    expired: "bg-slate-300 text-slate-800",
    revoked: "bg-rose-100 text-rose-700",
  };

  const isLocked = session.status === 'locked' || session.confirm_attempts >= 3;
  const isCompleted = session.status === 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/test-sessions" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sesi Ujian / Test Session</h2>
          <p className="text-sm text-slate-500">Audit token & keamanan akses tes psikologi.</p>
        </div>
      </div>

      {isLocked && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold">Sesi Terkunci Secara Otomatis (Security Lock)</h3>
            <p className="text-red-700 text-sm mt-1">
              Pengguna gagal memverifikasi 4 digit terakhir nomor WhatsApp sebanyak 3 kali berturut-turut. Ini bisa mengindikasikan bahwa link ujian diteruskan/di-forward ke pihak lain yang tidak berhak. Sesi tidak dapat di-resume. Jika ini adalah kesalahan, harap hubungi pelanggan dan buat ulang sesi baru.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-blue-600" />
            Detail Partisipan
          </h3>
          
          <div className="grid grid-cols-2 gap-y-4">
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Peserta Tes</p>
              <Link href={`/panel/customers/${session.customer_id}`} className="font-semibold text-blue-600 hover:underline">
                {session.customer_name}
              </Link>
              <p className="text-xs text-slate-500 font-mono mt-1">{session.whatsapp_number}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Kode Registrasi</p>
              <Link href={`/panel/registrations/${session.registration_id}`} className="font-medium text-slate-900 hover:underline">
                {session.registration_code}
              </Link>
            </div>
            <div>
              <p className="text-sm text-slate-500">Alat Tes</p>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200">
                {session.test_code}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-500">Status Saat Ini</p>
              <span className={`inline-block px-3 py-1 mt-1 rounded-full text-sm font-bold uppercase tracking-wider ${statusColors[session.status]}`}>
                {session.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-600" />
            Security & Token
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Access Token (One-Time Link)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-slate-50 text-slate-600 text-xs font-mono rounded border border-slate-200 truncate">
                  {isCompleted ? "********** (Sudah Kadaluarsa)" : session.access_token}
                </code>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Digunakan untuk mengakses halaman pengerjaan tes. Hanya berlaku 1x.</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Result Token (Permanent Link)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-slate-50 text-slate-900 text-xs font-mono rounded border border-slate-200 truncate">
                  {session.result_token}
                </code>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Digunakan untuk melihat lembar hasil tes setelah selesai.</p>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Percobaan Konfirmasi Identitas</p>
                <p className="font-bold text-slate-900">{session.confirm_attempts} / 3 <span className="text-xs font-normal text-slate-500">Maksimal</span></p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i <= session.confirm_attempts ? 'bg-red-500' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Audit Timeline
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Dibuat Pada</p>
            <p className="text-sm font-medium text-slate-900">{new Date(session.created_at).toLocaleString("id-ID")}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Mulai Mengerjakan</p>
            <p className="text-sm font-medium text-slate-900">{session.started_at ? new Date(session.started_at).toLocaleString("id-ID") : "-"}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Selesai</p>
            <p className="text-sm font-medium text-slate-900">{session.completed_at ? new Date(session.completed_at).toLocaleString("id-ID") : "-"}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Terkunci Pada</p>
            <p className="text-sm font-medium text-slate-900">{session.locked_at ? new Date(session.locked_at).toLocaleString("id-ID") : "-"}</p>
          </div>
        </div>

        {!isCompleted && !isLocked && session.status !== 'revoked' && session.status !== 'expired' && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
            <form action={revokeSession}>
              <button type="submit" className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-semibold text-sm transition-colors">
                Revoke / Batalkan Sesi
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
