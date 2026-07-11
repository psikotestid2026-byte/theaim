import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, CheckCircle, Search, AlertTriangle } from "lucide-react";

export default async function TestResultDetailPage({ params }: { params: { id: string } }) {
  const resultId = parseInt(params.id, 10);
  if (isNaN(resultId)) notFound();

  const results = await sql`
    SELECT res.*, s.test_code, s.result_token, c.full_name as customer_name, c.whatsapp_number
    FROM test_results res
    JOIN test_sessions s ON s.id = res.test_session_id
    JOIN customers c ON c.id = res.customer_id
    WHERE res.id = ${resultId}
  `.catch(() => []);

  if (results.length === 0) notFound();
  const res = results[0];

  const interpretation = res.interpretation as any || {};
  const rawScores = res.raw_scores as any || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/panel/test-results" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hasil Tes: {res.customer_name}</h2>
          <p className="text-sm text-slate-500">Analisis dan snapshot hasil ujian psikologi.</p>
        </div>
      </div>

      {(res.validity_flag === 'suspect_speed' || res.validity_flag === 'suspect_response_set') && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-amber-800 font-bold">Peringatan Validitas: {res.validity_flag.replace('_', ' ').toUpperCase()}</h3>
            <p className="text-amber-700 text-sm mt-1">
              Hasil tes ini ditandai oleh sistem. Penyebab yang mungkin: 
              {res.validity_flag === 'suspect_speed' ? ' Durasi pengerjaan terlalu singkat (mengisi asal).' : ' Terdapat pola jawaban berulang yang mencurigakan.'} 
              Hasil tetap dapat diakses namun validitasnya dipertanyakan secara klinis.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-extrabold tracking-tight" style={{ color: interpretation.color_hex || '#0f172a' }}>
                {res.result_type}
              </h3>
              <p className="text-lg font-medium text-slate-700 mt-1">{interpretation.label_id || interpretation.label_en || "-"}</p>
              <p className="text-slate-500 italic mt-2">&quot;{interpretation.tagline || "-"}&quot;</p>
              
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900 mb-2">Gambaran Umum</p>
                <div 
                  className="prose prose-sm prose-slate max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: interpretation.description || "Tidak ada deskripsi snapshot tersedia." }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Karakteristik
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded inline-block mb-3">Potensi Kekuatan</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                  {(interpretation.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                  {(!interpretation.strengths || interpretation.strengths.length === 0) && <li>Tidak ada data tersimpan</li>}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded inline-block mb-3">Tantangan</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                  {(interpretation.challenges || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                  {(!interpretation.challenges || interpretation.challenges.length === 0) && <li>Tidak ada data tersimpan</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Meta Data
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Kode Tes</p>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded border border-slate-200">
                  {res.test_code}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">WA Summary Preview</p>
                <div className="p-3 bg-green-50 rounded-lg text-xs text-green-900 whitespace-pre-wrap font-mono border border-green-100">
                  {res.wa_summary_text || "Tidak tersedia."}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Tautan Publik (Result URL)</p>
                <a href={`/hasil/${res.result_token}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all font-mono">
                  /hasil/{res.result_token}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              Raw Scores Audit
            </h3>
            <p className="text-xs text-slate-400 mb-4">JSON snapshot skor mentah saat tes dihitung.</p>
            <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto text-emerald-400">
              {JSON.stringify(rawScores, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
