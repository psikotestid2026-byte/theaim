import DiscGraphs from "@/components/test/DiscGraphs";
import { getEnneagramCoreInfo, getEnneagramWingInfo } from "@/lib/scoring/ruangtes/enneagram_dictionary";
import { MIN_HEADLINE_ITEMS, thinBigFiveNote } from "@/lib/scoring/ruangtes/bigfive";
import { msaiQuadrantLeaders } from "@/lib/msai-label";
import { EXPIRY_AUTO_SUBMIT_HEADING, expiryAnsweredLine } from "@/lib/test-timer";

type Detail = Record<string, unknown>;

function asRecord(value: unknown): Detail | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Detail;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatGap(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(2);
  return "–";
}

export default function RetailScoreDetail({ detail }: { detail: unknown }) {
  const data = asRecord(detail);
  if (!data || typeof data.kind !== "string") return null;

  if (data.kind === "disc") {
    const g1 = asRecord(data.g1);
    const g2 = asRecord(data.g2);
    const g3 = asRecord(data.g3);
    if (!g1 || !g2 || !g3) return null;
    const graph = (row: Detail) => ({
      D: asNumber(row.D) ?? 0,
      I: asNumber(row.I) ?? 0,
      S: asNumber(row.S) ?? 0,
      C: asNumber(row.C) ?? 0,
    });
    return <DiscGraphs g1={graph(g1)} g2={graph(g2)} g3={graph(g3)} />;
  }

  if (data.kind === "bigfive" && Array.isArray(data.dimensions)) {
    return (
      <div className="space-y-4 mb-8">
        <h2 className="font-extrabold text-slate-900">Lima faktor</h2>
        {data.dimensions.map((row) => {
          const item = asRecord(row);
          if (!item) return null;
          const percent = asNumber(item.percent) ?? 0;
          const itemCount = asNumber(item.itemCount);
          const thin = itemCount !== null && itemCount < MIN_HEADLINE_ITEMS;
          return (
            <div key={String(item.code)} className="print-avoid">
              <div className="flex justify-between text-sm font-semibold mb-1 gap-3">
                <span>{String(item.name)} · {String(item.category)}{itemCount !== null ? ` · ${itemCount} butir` : ""}</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
              </div>
              <p className="text-xs text-slate-500">{String(item.narrative ?? "")}</p>
              {thin && (
                <p className="text-xs font-semibold text-amber-800 mt-1">{thinBigFiveNote(String(item.name), itemCount)}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (data.kind === "riasec" && Array.isArray(data.rows)) {
    const max = Math.max(1, ...data.rows.map((row) => asNumber(asRecord(row)?.score) ?? 0));
    return (
      <div className="mb-8">
        <h2 className="font-extrabold text-slate-900 mb-1">Kode minat {String(data.interestCode ?? "")}</h2>
        <p className="text-sm text-slate-500 mb-4">Konsistensi: {String(data.consistency ?? "")}</p>
        <div className="space-y-3">
          {data.rows.map((row) => {
            const item = asRecord(row);
            if (!item) return null;
            const score = asNumber(item.score) ?? 0;
            return (
              <div key={String(item.code)}>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span>{String(item.code)} · {String(item.name)}</span>
                  <span>{score}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${(score / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (data.kind === "papi" && Array.isArray(data.aspects)) {
    return (
      <div className="mb-8">
        <h2 className="font-extrabold text-slate-900 mb-3">Profil aspek</h2>
        <div className="space-y-2">
          {data.aspects.map((row) => {
            const item = asRecord(row);
            if (!item) return null;
            const score = asNumber(item.score) ?? 0;
            return (
              <div key={String(item.code)} className="print-avoid">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{String(item.code)} · {String(item.name)}</span>
                  <span>{score}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-red-600" style={{ width: `${Math.min(100, (score / 9) * 100)}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{String(item.note ?? "")}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (data.kind === "msai" && Array.isArray(data.skills)) {
    const leaders = msaiQuadrantLeaders(data.quadrantScores);
    return (
      <div className="mb-8 overflow-x-auto">
        {leaders.length > 1 ? (
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Kuadran seri: {leaders.map((row) => row.name).join(", ")} ({formatGap(leaders[0].score)})
          </p>
        ) : leaders.length === 1 ? (
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Kuadran tertinggi: {leaders[0].name} ({formatGap(leaders[0].score)})
          </p>
        ) : null}
        <h2 className="font-extrabold text-slate-900 mb-3">Keterampilan</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-3">Keterampilan</th>
              <th className="py-2 pr-3">Aktual</th>
              <th className="py-2 pr-3">Penting</th>
              <th className="py-2">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {data.skills.map((row) => {
              const item = asRecord(row);
              if (!item) return null;
              return (
                <tr key={String(item.name)} className="border-t border-slate-100">
                  <td className="py-2 pr-3">{String(item.name)}</td>
                  <td className="py-2 pr-3">{formatGap(item.actual)}</td>
                  <td className="py-2 pr-3">{formatGap(item.importance)}</td>
                  <td className="py-2">{formatGap(item.gap)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.kind === "ist") {
    return (
      <div className="mb-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-bold text-slate-900 mb-1">RA {String(data.raScore ?? 0)}/20 · ZR {String(data.zrScore ?? 0)}/20</p>
        <p>{String(data.note ?? "")}</p>
      </div>
    );
  }

  if (data.kind === "mbti") {
    const percent = asRecord(data.percent);
    if (!percent) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.entries(percent).map(([pole, value]) => (
          <div key={pole} className="rounded-xl bg-slate-50 px-3 py-2 print-avoid">
            <p className="text-xs font-bold text-slate-500">{pole}</p>
            <p className="text-lg font-black text-slate-900">{String(value)}%</p>
          </div>
        ))}
      </div>
    );
  }

  if (data.kind === "msdt") {
    const scores = asRecord(data.scores);
    const orientation = asRecord(data.orientationCategory);
    if (!scores) return null;
    return (
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(scores).map(([code, value]) => (
            <div key={code} className="rounded-xl bg-slate-50 px-3 py-2 print-avoid">
              <p className="text-xs font-bold text-slate-500">{code}</p>
              <p className="text-lg font-black text-slate-900">{String(value)}</p>
            </div>
          ))}
        </div>
        {orientation && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-extrabold text-slate-900 mb-2">Orientasi</h2>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>Orientasi tugas: {String(orientation.TO ?? "–")}</li>
              <li>Orientasi relasi: {String(orientation.RO ?? "–")}</li>
              <li>Efektivitas: {String(orientation.E ?? "–")}</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (data.kind === "enneagram") {
    const scores = asRecord(data.scores) ?? {};
    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((type) => {
      const info = getEnneagramCoreInfo(type);
      const score = asNumber(scores[type]) ?? asNumber(scores[String(type)]) ?? 0;
      return { type, name: info?.name ?? `Tipe ${type}`, description: info?.description ?? "", score };
    });
    const max = Math.max(1, ...rows.map((row) => row.score));
    const dominant = rows.reduce((best, row) => (row.score > best.score ? row : best), rows[0]);
    const wingCode = typeof data.wingCode === "string" ? data.wingCode : "";
    const wing = wingCode ? getEnneagramWingInfo(wingCode) : undefined;
    return (
      <div className="mb-8">
        <h2 className="font-extrabold text-slate-900 mb-1">
          {dominant.name}
          {wing ? ` · ${wing.label}` : ""}
        </h2>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{wing?.description ?? dominant.description}</p>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.type} className={row.type === dominant.type ? "print-avoid" : "print-avoid"}>
              <div className="flex justify-between text-sm font-semibold mb-1 gap-3">
                <span>{row.type}. {row.name}</span>
                <span>{row.score}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.type === dominant.type ? "bg-red-600" : "bg-slate-400"}`}
                  style={{ width: `${(row.score / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.kind === "wpt") {
    const answered = asNumber(data.answered);
    const total = asNumber(data.total);
    const submittedByExpiry = data.submittedByExpiry === true && answered !== null && total !== null;
    return (
      <div className="mb-8">
        {submittedByExpiry && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="font-bold text-amber-950">{EXPIRY_AUTO_SUBMIT_HEADING}</p>
            <p className="text-sm text-amber-900 mt-1">{expiryAnsweredLine(answered, total)}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">Jawaban benar</p>
            <p className="text-2xl font-black text-slate-900">{String(data.rawScore ?? "")}/50</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">IQ</p>
            <p className="text-2xl font-black text-slate-900">{String(data.iq ?? "")}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
