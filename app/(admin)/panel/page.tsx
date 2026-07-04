import { countRegistrations } from "@/lib/queries/registrations";
import { countPendingPayments } from "@/lib/queries/payments";
// Optional: import other stats from db if needed

export default async function AdminDashboardPage() {
  const [totalRegistrations, totalPayments] = await Promise.all([
    countRegistrations(),
    countPendingPayments(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pendaftaran</p>
            <p className="text-3xl font-black text-slate-900">{totalRegistrations}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">📝</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
            <p className="text-3xl font-black text-slate-900">{totalPayments}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl">💳</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tes Selesai</p>
            <p className="text-3xl font-black text-slate-900">0</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-2xl">🧠</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Selamat Datang di Panel Admin</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Ini adalah simulasi panel admin. Saat ini NextAuth di-bypass untuk keperluan development (sesuai instruksi).
          Anda dapat melihat data dari pendaftaran dan pembayaran di menu sebelah kiri.
        </p>
        
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <h4 className="font-bold text-sm text-slate-900 mb-2">Simulasi Proses Pendaftaran → Tes:</h4>
          <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
            <li>Customer mengisi form di Web Publik (<strong>/daftar</strong>)</li>
            <li>Customer dialihkan ke Halaman Pembayaran (<strong>/pembayaran/[kode]</strong>)</li>
            <li>Customer menekan "Simulasi Sudah Bayar"</li>
            <li>Status pendaftaran menjadi <code>paid</code> dan sesi tes dibuat secara otomatis</li>
            <li>Customer mendapatkan link tes dan dapat membuka tes (<strong>/tes/[token]</strong>)</li>
            <li>Setelah verifikasi 4-digit WA terakhir, customer mengerjakan soal</li>
            <li>Hasil langsung keluar (<strong>/hasil/[resultToken]</strong>)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
