import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionByAccessToken } from "@/lib/queries/test-sessions";
import IdentityConfirmForm from "@/components/test/IdentityConfirmForm";
import { maskWhatsApp } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tes Psikologi Online — TheAIM",
  robots: "noindex,nofollow",
};

// Locked screen
function LockedScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-[420px] w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">🔒</div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Akses Dikunci</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">Terlalu banyak percobaan verifikasi yang gagal. Link tes ini telah dikunci untuk alasan keamanan.</p>
        <a href="https://wa.me/6281999554599" target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2">
          💬 Hubungi Admin TheAIM
        </a>
      </div>
    </div>
  );
}

function ExpiredScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-[420px] w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">⏰</div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Link Kadaluarsa</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">Link tes ini sudah tidak berlaku. Hubungi admin TheAIM untuk mendapatkan link baru.</p>
        <a href="https://wa.me/6281999554599" target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2">
          💬 Hubungi Admin TheAIM
        </a>
      </div>
    </div>
  );
}

export default async function TestGatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSessionByAccessToken(token).catch(() => null);

  if (!session) return notFound();

  if (session.status === "locked") return <LockedScreen />;
  if (session.status === "expired" || session.status === "revoked") return <ExpiredScreen />;

  // Check if expired by time
  if (new Date(session.expires_at) < new Date()) return <ExpiredScreen />;

  // Already completed → redirect to result
  if (session.status === "completed") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-[420px] w-full bg-white rounded-3xl p-10 shadow-xl text-center">
          <div className="text-4xl mb-5">✅</div>
          <h1 className="text-2xl font-extrabold mb-3">Tes Sudah Selesai</h1>
          <p className="text-slate-500 text-sm mb-8">Tes ini sudah pernah diselesaikan. Akses hasil Anda di link di bawah ini.</p>
          <Link href={`/hasil/${session.result_token}`} className="btn-primary px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2">
            📊 Lihat Hasil Tes →
          </Link>
        </div>
      </div>
    );
  }

  const maskedWa = maskWhatsApp(session.whatsapp_number ?? "");

  return (
    <IdentityConfirmForm
      token={token}
      maskedWa={maskedWa}
      sessionId={session.id}
      resultToken={session.result_token}
    />
  );
}
