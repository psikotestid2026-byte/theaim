import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { formatResultDate } from "@/lib/format-date";
import { msaiResultBadge } from "@/lib/msai-label";
import { presentStrengths, SUMMARY_HEADING } from "@/lib/result-strengths";
import { resultPageUrl, siteOrigin } from "@/lib/site-url";
import { getMasterTestByCode } from "@/lib/queries/master-tests";
import { getSessionByResultToken } from "@/lib/queries/test-sessions";
import { getResultBySessionId } from "@/lib/queries/test-results";
import { getTmResultBySessionId } from "@/lib/queries/tm-results";
import { getCachedTestResult } from "@/lib/redis";
import PrintButton from "@/components/test/PrintButton";
import QRCodeDisplay from "@/components/test/QRCodeDisplay";
import TalentsMappingReport from "@/components/test/TalentsMappingReport";
import RetailScoreDetail from "@/components/test/RetailScoreDetail";
import { presentTakerResult } from "@/lib/taker-view";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ resultToken: string }> }): Promise<Metadata> {
  const { resultToken } = await params;
  const session = await getSessionByResultToken(resultToken).catch(() => null);
  if (!session) return { title: "Hasil Tes — TheAIM" };
  const result = await getResultBySessionId(session.id).catch(() => null);
  const headline = result?.result_type || session.test_code;
  return {
    title: `Hasil ${headline} — ${session.customer_name} | TheAIM`,
    description: `Hasil tes psikologi untuk ${session.customer_name}. Diterbitkan oleh PT Abadi Insan Manfaat (TheAIM).`,
    openGraph: {
      title: `Hasil ${headline} — TheAIM`,
      description: "Lihat hasil tes psikologi Anda secara online dan simpan sebagai PDF dari peramban.",
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
  const view = presentTakerResult(result, resultToken);

  const headerList = await headers();
  const resultUrl = resultPageUrl(
    resultToken,
    siteOrigin({
      forwardedHost: headerList.get("x-forwarded-host"),
      host: headerList.get("host"),
      forwardedProto: headerList.get("x-forwarded-proto"),
    }),
  );
  const challenges: string[] = view.interpretation?.challenges ?? [];
  const listed = presentStrengths({
    testCode: session.test_code,
    strengths: view.interpretation?.strengths,
    detail: view.interpretation?.detail,
  });
  const strengthBlocks = [listed.strengths.length > 0, listed.summary.length > 0, challenges.length > 0].filter(Boolean).length;
  const careers: string[] = view.interpretation?.careers ?? [];
  const isTalents = session.test_code.toLowerCase() === "talents_mapping";
  const tm = isTalents ? await getTmResultBySessionId(session.id).catch(() => null) : null;
  const detailKind = view.interpretation?.detail && typeof view.interpretation.detail === "object"
    ? String((view.interpretation.detail as { kind?: string }).kind ?? "")
    : "";
  const showGenericBars = !isTalents && !detailKind && view.raw_scores && Object.keys(view.raw_scores).length > 0;
  const master = await getMasterTestByCode(session.test_code).catch(() => null);
  const testTitle = master?.name?.trim() || session.test_code;
  const resultBadge = session.test_code.toLowerCase() === "msai" ? msaiResultBadge(view) : view.result_label;

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
              {testTitle} — Hasil Tes Psikologi
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">{view.result_type}</h1>
            <p className="text-xl font-bold text-red-600 mb-4">{resultBadge}</p>
            <p className="text-slate-500 text-sm">
              Untuk: <strong className="text-slate-900">{session.customer_name}</strong> ·{" "}
              {formatResultDate(view.created_at)}
            </p>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8">
            <p className="text-slate-700 leading-relaxed text-sm">{view.interpretation?.description}</p>
          </div>

          {isTalents && (
            <TalentsMappingReport
              talentRanking={tm?.talent_ranking}
              domainDistribution={tm?.domain_distribution}
            />
          )}

          {!isTalents && <RetailScoreDetail detail={view.interpretation?.detail} />}

          {strengthBlocks > 0 && (
          <div className={`grid gap-6 mb-8 ${strengthBlocks > 1 ? "md:grid-cols-2" : ""}`}>
            {listed.strengths.length > 0 && (
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 print-avoid">
              <h2 className="font-extrabold text-green-800 mb-4">Kekuatan utama</h2>
              <ul className="space-y-2">
                {listed.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="mt-0.5 text-green-500 shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            )}
            {listed.summary.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 print-avoid">
              <h2 className="font-extrabold text-slate-800 mb-4">{SUMMARY_HEADING}</h2>
              <ul className="space-y-2">
                {listed.summary.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700">{s}</li>
                ))}
              </ul>
            </div>
            )}
            {challenges.length > 0 && (
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 print-avoid">
              <h2 className="font-extrabold text-orange-800 mb-4">Area pengembangan</h2>
              <ul className="space-y-2">
                {challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-700">
                    <span className="mt-0.5 text-orange-500 shrink-0">→</span>{c}
                  </li>
                ))}
              </ul>
            </div>
            )}
          </div>
          )}

          {careers.length > 0 && (
            <div className="mb-8 print-avoid">
              <h2 className="font-extrabold text-slate-900 mb-3">Arah peran</h2>
              <p className="text-sm text-slate-600">{careers.join(" · ")}</p>
            </div>
          )}

          {showGenericBars && view.raw_scores && (
            <div className="mb-8">
              <h2 className="font-extrabold text-slate-900 mb-4">📊 Breakdown Skor</h2>
              <div className="space-y-3">
                {Object.entries(view.raw_scores as Record<string, number>)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, val]) => {
                    const total = Object.values(view.raw_scores as Record<string, number>).reduce((a, b) => a + b, 0);
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
