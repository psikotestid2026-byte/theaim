import "@/app/globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Panel - TheAIM",
  robots: "noindex,nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-20 lg:pt-8 px-4 lg:px-8 pb-8">
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
