import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionByResultToken } from "@/lib/queries/test-sessions";
import { getResultBySessionId } from "@/lib/queries/test-results";
import { getCachedTestResult } from "@/lib/redis";
import PrintButton from "@/components/test/PrintButton";
import QRCodeDisplay from "@/components/test/QRCodeDisplay";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ resultToken: string }> }): Promise<Metadata> {
  const { resultToken } = await params;
  const session = await getSessionByResultToken(resultToken).catch(() => null);
  if (!session) return { title: "Hasil Tes — TheAIM" };
  return {
    title: `Hasil ${session.test_code} — ${session.customer_name} | TheAIM`,
    description: `Hasil tes psikologi ${session.test_code} untuk ${session.customer_name}. Diterbitkan oleh PT Abadi Insan Manfaat (TheAIM).`,
    openGraph: {
      title: `Hasil ${session.test_code} — TheAIM`,
      description: `Lihat hasil tes psikologi ${session.test_code} Anda secara online dan unduh sebagai PDF.`,
    },
    robots: "noindex",
  };
}

export default async function HasilPage({ params }: { params: Promise<{ resultToken: string }> }) {
  const { resultToken } = await params;

  const session = await getSessionByResultToken(resultToken).catch(() => null);
  if (!session || session.status !== "completed") return notFound();

  // Try cache first, then DB
  let result = await getCachedTestResult(resultToken).catch(() => null);
  if (!result) {
    result = await getResultBySessionId(session.id).catch(() => null);
  }
  if (!result) return notFound();

  const resultUrl = `${process.env.NEXTAUTH_URL ?? "https://theaim.id"}/hasil/${resultToken}`;
  const strengths: string[] = result.interpretation?.strengths ?? [];
  const challenges: string[] = result.interpretation?.challenges ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/20 print-page">
      {/* Print header */}
      <div className="bg-white border-b border-slate-100 no-print">
        <div className="max-w-[800px] mx-auto px-4 py-4 flex items-center justify-between">
          <Image src="/Logo2/Logo theaim.id.png" alt="TheAIM" width={100} height={36} className="h-9 w-auto" />
          <div className="flex items-center gap-3">
            <a href="https://wa.me/6281999554599" target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors">
              Konsultasi Lanjutan →
            </a>
            <PrintButton />
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-12">
        {/* Hero result card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 mb-8">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full mb-4">
              {session.test_code} — Hasil Tes Psikologi
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">{result.result_type}</h1>
            <p className="text-xl font-bold text-red-600 mb-4">{result.result_label}</p>
            <p className="text-slate-500 text-sm">
              Untuk: <strong className="text-slate-900">{session.customer_name}</strong> ·{" "}
              {new Date(result.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8">
            <p className="text-slate-700 leading-relaxed text-sm">{result.interpretation?.description}</p>
          </div>

          {/* Strengths & Challenges */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h2 className="font-extrabold text-green-800 mb-4 flex items-center gap-2">✨ Kekuatan Utama</h2>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="mt-0.5 text-green-500 shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <h2 className="font-extrabold text-orange-800 mb-4 flex items-center gap-2">🎯 Area Pengembangan</h2>
              <ul className="space-y-2">
                {challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-700">
                    <span className="mt-0.5 text-orange-500 shrink-0">→</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Score breakdown */}
          {result.raw_scores && Object.keys(result.raw_scores).length > 0 && (
            <div className="mb-8">
              <h2 className="font-extrabold text-slate-900 mb-4">📊 Breakdown Skor</h2>
              <div className="space-y-3">
                {Object.entries(result.raw_scores as Record<string, number>)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, val]) => {
                    const total = Object.values(result.raw_scores as Record<string, number>).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <span className="text-slate-700">{key}</span>
                          <span className="text-slate-500">{val} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* QR Code + share */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Akses Permanen</p>
              <QRCodeDisplay url={resultUrl} />
              <p className="text-[11px] text-slate-400 mt-2">Scan untuk akses hasil</p>
            </div>
            <div className="flex-1">
              <h2 className="font-extrabold text-slate-900 mb-3">Akses Hasil Secara Permanen</h2>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                Halaman ini dapat diakses kapan saja melalui link atau QR code di atas. Simpan link ini untuk referensi masa depan.
              </p>
              <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs text-slate-600 break-all border border-slate-200 mb-4">{resultUrl}</div>
              <div className="flex flex-col sm:flex-row gap-3">
                <PrintButton />
                <a
                  href={`https://wa.me/6281999554599?text=Halo%20TheAIM%2C%20saya%20ingin%20konsultasi%20lanjutan%20dari%20hasil%20tes%20${session.test_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-corp py-3 px-6 rounded-xl text-sm inline-flex items-center gap-2 justify-center"
                >
                  💬 Konsultasi Lanjutan via WA
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-[12px] text-slate-400 pb-8 leading-relaxed">
          <p>Laporan ini diterbitkan oleh <strong className="text-slate-600">PT Abadi Insan Manfaat (TheAIM)</strong></p>
          <p className="mt-1">Hasil bersifat rahasia dan hanya untuk keperluan pengembangan diri. Tidak diperkenankan disebarluaskan.</p>
        </div>
      </div>
    </div>
  );
}
