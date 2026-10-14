import type { TmRankEntry, TmResultsReady } from "@/lib/scoring/talents-mapping";

const LEVEL_LABEL: Record<TmRankEntry["level"], string> = {
  dominant: "Dominan",
  supporting: "Pendukung",
  neutral: "Netral",
  weak: "Lemah",
  very_weak: "Sangat lemah",
};

const COLOR_CLASS: Record<TmRankEntry["color"], string> = {
  red: "bg-red-600 text-white",
  yellow: "bg-amber-400 text-slate-900",
  white: "bg-white text-slate-700 border border-slate-300",
  grey: "bg-slate-400 text-white",
  black: "bg-slate-900 text-white",
};

function asRanking(value: unknown): TmRankEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is TmRankEntry => {
    if (!row || typeof row !== "object") return false;
    const item = row as Partial<TmRankEntry>;
    return typeof item.rank === "number" && typeof item.code === "string" && typeof item.name === "string";
  });
}

function asDomains(value: unknown): TmResultsReady["domain_distribution"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: TmResultsReady["domain_distribution"] = {};
  for (const [domain, bucket] of Object.entries(value as Record<string, unknown>)) {
    if (!bucket || typeof bucket !== "object") continue;
    const row = bucket as { count?: unknown; dominant_count?: unknown };
    if (typeof row.count !== "number") continue;
    out[domain] = {
      count: row.count,
      dominant_count: typeof row.dominant_count === "number" ? row.dominant_count : 0,
    };
  }
  return out;
}

export default function TalentsMappingReport({
  talentRanking,
  domainDistribution,
}: {
  talentRanking: unknown;
  domainDistribution: unknown;
}) {
  const ranking = asRanking(talentRanking);
  const domains = asDomains(domainDistribution);
  if (ranking.length === 0) {
    return (
      <p className="text-sm text-slate-500 bg-slate-50 rounded-2xl p-4">
        Peringkat tema belum tersimpan untuk sesi ini.
      </p>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="font-extrabold text-slate-900 mb-3">Peringkat 34 tema</h2>
      <div className="flex flex-wrap gap-2 mb-4 text-[11px] font-bold">
        {(Object.keys(LEVEL_LABEL) as TmRankEntry["level"][]).map((level) => {
          const sample = ranking.find((row) => row.level === level);
          if (!sample) return null;
          return (
            <span key={level} className={`px-2 py-1 rounded-full ${COLOR_CLASS[sample.color]}`}>
              {LEVEL_LABEL[level]}
            </span>
          );
        })}
      </div>
      {Object.keys(domains).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
          {Object.entries(domains).map(([domain, bucket]) => (
            <div key={domain} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 print-avoid">
              <p className="text-[11px] font-bold text-slate-500">{domain}</p>
              <p className="text-sm font-black text-slate-900">{bucket.count} tema</p>
              <p className="text-[11px] text-slate-500">{bucket.dominant_count} dominan</p>
            </div>
          ))}
        </div>
      )}
      <ol className="space-y-2">
        {ranking.map((row) => (
          <li key={row.code} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 print-avoid">
            <span className="w-8 text-sm font-black text-slate-400">{row.rank}</span>
            <span className={`w-3 h-3 rounded-full shrink-0 ${COLOR_CLASS[row.color] ?? "bg-slate-300"}`} />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-slate-900">{row.name}</span>
              <span className="block text-[11px] text-slate-500">{row.domain} · {LEVEL_LABEL[row.level] ?? row.level}</span>
            </span>
            <span className="text-sm font-black text-slate-700">{row.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
