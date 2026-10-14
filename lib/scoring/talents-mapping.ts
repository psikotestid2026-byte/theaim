import type { TestItem, TestResultPayload } from "@/types/db";
import { TALENT_THEME_SEEDS } from "@/db/seed-data/talent-catalog";
import { itemOptions } from "./answer-map";

export type TmLevel = "dominant" | "supporting" | "neutral" | "weak" | "very_weak";
export type TmColor = "red" | "yellow" | "white" | "grey" | "black";

export interface TmRankEntry {
  rank: number;
  code: string;
  name: string;
  domain: string;
  score: number;
  level: TmLevel;
  color: TmColor;
}

export interface TmDomainBucket {
  count: number;
  dominant_count: number;
}

export interface TmResultsReady {
  talent_ranking: TmRankEntry[];
  domain_distribution: Record<string, TmDomainBucket>;
}

export interface TalentsMappingScore extends TestResultPayload {
  tm: TmResultsReady;
}

const BANDS: { maxRank: number; level: TmLevel; color: TmColor }[] = [
  { maxRank: 7, level: "dominant", color: "red" },
  { maxRank: 14, level: "supporting", color: "yellow" },
  { maxRank: 20, level: "neutral", color: "white" },
  { maxRank: 27, level: "weak", color: "grey" },
  { maxRank: 34, level: "very_weak", color: "black" },
];

function bandForRank(rank: number): { level: TmLevel; color: TmColor } {
  return BANDS.find((band) => rank <= band.maxRank) ?? BANDS[BANDS.length - 1];
}

function likertPoints(item: TestItem, raw: string): number | null {
  const numeric = Number(raw);
  let points: number | null = null;
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 5) {
    points = numeric;
  } else {
    const match = itemOptions(item).find((opt) => opt.value === raw || opt.label === raw);
    const fromOption = Number(match?.score_val ?? match?.value);
    if (Number.isInteger(fromOption) && fromOption >= 1 && fromOption <= 5) points = fromOption;
  }
  if (points === null) return null;
  const meta = item.scoring_meta as { polarity?: string } | null;
  if (meta?.polarity === "negative") return 6 - points;
  return points;
}

/**
 * Rank the 34 Talents Mapping themes.
 * Sum Likert points per theme (reverse a negative stem as 6 − value), sort high to low,
 * then assign the five published rank bands. Ties break on theme code so the order is stable.
 * Does not score PSS, ST-30, or careers.
 */
export function computeTalentsMapping(
  responses: Record<number, string>,
  items: TestItem[],
): TalentsMappingScore {
  const themes = new Map<string, { name: string; domain: string; score: number }>();
  for (const theme of TALENT_THEME_SEEDS) {
    themes.set(theme.code, { name: theme.name, domain: theme.domain, score: 0 });
  }

  for (const item of items) {
    const meta = (item.scoring_meta ?? {}) as { theme_code?: string; theme_name?: string; domain?: string };
    const code = meta.theme_code;
    if (!code || !themes.has(code)) continue;
    const raw = responses[Number(item.id)];
    if (!raw) continue;
    const points = likertPoints(item, raw);
    if (points === null) continue;
    const theme = themes.get(code)!;
    theme.score += points;
    if (meta.theme_name) theme.name = meta.theme_name;
    if (meta.domain) theme.domain = meta.domain;
  }

  const sorted = [...themes.entries()].sort((a, b) => {
    if (b[1].score !== a[1].score) return b[1].score - a[1].score;
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  });

  const talent_ranking: TmRankEntry[] = sorted.map(([code, theme], index) => {
    const rank = index + 1;
    const band = bandForRank(rank);
    return {
      rank,
      code,
      name: theme.name,
      domain: theme.domain,
      score: theme.score,
      level: band.level,
      color: band.color,
    };
  });

  const domain_distribution: Record<string, TmDomainBucket> = {};
  for (const row of talent_ranking) {
    const bucket = domain_distribution[row.domain] ?? { count: 0, dominant_count: 0 };
    bucket.count += 1;
    if (row.level === "dominant") bucket.dominant_count += 1;
    domain_distribution[row.domain] = bucket;
  }

  const top = talent_ranking[0];
  const dominant = talent_ranking.filter((row) => row.level === "dominant");
  const raw_scores: Record<string, number> = {};
  for (const row of talent_ranking) raw_scores[row.code] = row.score;

  const headline = top ? `${top.name} (${top.domain})` : "Talents Mapping";
  const dominantNames = dominant.map((row) => row.name).join(", ");

  return {
    raw_scores,
    result_type: top?.name ?? "Talents Mapping",
    result_label: top ? `${top.domain} · peringkat 1` : "Peringkat tema",
    interpretation: {
      description: top
        ? `Tema yang paling menonjol adalah ${headline}. Tujuh tema dominan: ${dominantNames}. Peringkat lengkap 34 tema memakai lima pita: dominan, pendukung, netral, lemah, dan sangat lemah.`
        : "Peringkat tema belum dapat dihitung karena tidak ada jawaban.",
      strengths: dominant.map((row) => `${row.name} (${row.domain})`),
      challenges: [
        "Pita sangat lemah hanya berarti tema itu kurang menonjol pada instrumen ini, bukan diagnosis.",
      ],
    },
    wa_summary_text: top
      ? `Hasil Talents Mapping kamu sudah siap.\n\nTema dominan: ${headline}.\n\nPeringkat 34 tema ada di halaman hasil.`
      : "Hasil Talents Mapping kamu sudah siap.\n\nPeringkat tema ada di halaman hasil.",
    tm: { talent_ranking, domain_distribution },
  };
}
