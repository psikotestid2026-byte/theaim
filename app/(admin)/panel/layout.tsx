import "@/app/globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - TheAIM",
  robots: "noindex,nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-slate-800">
          <Link href="/panel" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white">A</div>
            <span className="font-bold text-lg tracking-tight">TheAIM Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Modul Utama</p>
          <Link href="/panel/registrations" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            📝 Pendaftaran
          </Link>
          <Link href="/panel/payments" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            💳 Pembayaran
          </Link>
          <Link href="/panel/test-sessions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            🧠 Sesi Tes
          </Link>
          
          <div className="mt-8 mb-3"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Katalog</p>
          <Link href="/panel/services" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            📦 Layanan & Paket
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold">U</div>
            <div>
              <p className="text-sm font-bold text-white">Super Admin</p>
              <p className="text-[10px] text-slate-400">admin@theaim.id</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <Link href="/" className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors">
            Kembali ke Web Publik ↗
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
