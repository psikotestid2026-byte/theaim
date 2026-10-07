import { MIN_HEADLINE_ITEMS } from "@/lib/scoring/ruangtes/bigfive";

/** Green box on /hasil. Only genuinely high or positive items. */
export const STRENGTH_HEADING = "Kekuatan utama";

/** Neutral box for a cognitive score that is not above average. */
export const SUMMARY_HEADING = "Ringkasan";

/** WPT bands from this IQ upward are above the population average. */
export const WPT_ABOVE_AVERAGE_IQ = 110;

/** IST subtests are 20 items. Above the midpoint counts as above average. */
export const IST_SUBTEST_ITEMS = 20;

export type StrengthPresentation = {
  strengths: string[];
  summary: string[];
};

const WPT_HIGH_LABELS = ["Sangat Superior", "Superior", "Rata-rata Atas"] as const;
const WPT_OTHER_LABELS = ["Sangat Rendah", "Di Bawah Rata-rata", "Rata-rata Bawah", "Rata-rata"] as const;

const ENNEAGRAM_LIABILITY =
  /^(obsesif kompulsif|sedikit manipulatif|manipulatif|moody|depresif|keras kepala|argumentatif|tidak mau mendengar|insecure|terlalu khawatir|tidak mudah percaya|cepat bosan|tidak konsisten|tidak disiplin|tidak fokus|otoriter|tidak sensitif|kurang memiliki sifat empati|pasif|cari aman|pelupa|sulit membuka diri)\b/i;

const MBTI_PAIRS = [
  ["E", "I"],
  ["S", "N"],
  ["T", "F"],
  ["J", "P"],
] as const;

const MSDT_ORIENTATION: Record<string, string> = {
  TO: "Orientasi tugas",
  RO: "Orientasi relasi",
  E: "Efektivitas",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function linesOf(value: readonly string[] | null | undefined): string[] {
  return (value ?? []).map((line) => line.trim()).filter((line) => line.length > 0);
}

function kindOf(detail: unknown, testCode: string): string {
  const record = asRecord(detail);
  const kind = record && typeof record.kind === "string" ? record.kind : "";
  return (kind || testCode).toLowerCase();
}

export function wptIsAboveAverage(iq: number): boolean {
  return iq >= WPT_ABOVE_AVERAGE_IQ;
}

function wptLines(iq: number, label: string): StrengthPresentation {
  const lines = [`IQ ${iq}`];
  if (label) lines.push(label);
    if (wptIsAboveAverage(iq)) return { strengths: lines, summary: [] };
  return { strengths: [], summary: lines };
}

function wptFromStored(stored: string[]): StrengthPresentation {
  const strengths: string[] = [];
  const summary: string[] = [];
  for (const line of stored) {
    const iqMatch = /^IQ\s+(\d+)$/i.exec(line);
    if (iqMatch) {
      (Number(iqMatch[1]) >= WPT_ABOVE_AVERAGE_IQ ? strengths : summary).push(line);
      continue;
    }
    if (WPT_HIGH_LABELS.some((name) => line === name)) strengths.push(line);
    else if (WPT_OTHER_LABELS.some((name) => line === name)) summary.push(line);
    else if (isLowBandLabel(line)) summary.push(line);
    else strengths.push(line);
  }
  return { strengths, summary };
}

export function istIsAboveAverage(score: number): boolean {
  return score > IST_SUBTEST_ITEMS / 2;
}

function istLines(ra: number, zr: number): StrengthPresentation {
  const strengths: string[] = [];
  const summary: string[] = [];
  for (const [name, score] of [["RA", ra], ["ZR", zr]] as const) {
    const line = `${name} ${score}/${IST_SUBTEST_ITEMS}`;
    (istIsAboveAverage(score) ? strengths : summary).push(line);
  }
  return { strengths, summary };
}

/** A clear MBTI pole: ahead of its pair and at least half of that dichotomy. */
export function mbtiStrengthLines(percent: Record<string, number>): string[] {
  const lines: string[] = [];
  for (const [left, right] of MBTI_PAIRS) {
    const a = percent[left] ?? 0;
    const b = percent[right] ?? 0;
    if (a === b) continue;
    const pole = a > b ? left : right;
    const value = Math.max(a, b);
    if (value >= 50) lines.push(`${pole}: ${value}%`);
  }
  return lines;
}

export function isPositiveTrait(line: string): boolean {
  const text = line.trim();
  if (!text || isLowBandLabel(text)) return false;
  if (ENNEAGRAM_LIABILITY.test(text)) return false;
  return true;
}

export function positiveTraitLines(traits: readonly string[]): string[] {
  return traits.map((line) => line.trim()).filter((line) => isPositiveTrait(line));
}

function isLowBandLabel(line: string): boolean {
  const text = line.trim().toLowerCase();
  if (WPT_OTHER_LABELS.some((name) => text === name.toLowerCase())) return true;
  if (/:\s*rendah\b/.test(text)) return true;
  if (/\b(sangat rendah|di bawah rata-rata|rata-rata bawah)\b/.test(text)) return true;
  if (/\brendah\b/.test(text) && !text.includes("rendah hati")) return true;
  if (/\bsangat lemah\b/.test(text)) return true;
  if (/\bundershift\b|\bsuper syndrome\b|di bawah nol/.test(text)) return true;
  return false;
}

function msdtLines(category: Record<string, unknown>, stored: string[]): string[] {
  const rebuilt = Object.entries(MSDT_ORIENTATION)
    .filter(([code]) => category[code] === "Tinggi")
    .map(([, name]) => `${name}: Tinggi`);
  if (rebuilt.length > 0 || Object.keys(category).length > 0) return rebuilt;
  return stored.filter((line) => !isLowBandLabel(line) && /tinggi/i.test(line));
}

function bigFiveLines(dimensions: unknown[]): string[] {
  const lines: string[] = [];
  for (const row of dimensions) {
    const item = asRecord(row);
    if (!item) continue;
    const code = typeof item.code === "string" ? item.code : "";
    const name = typeof item.name === "string" ? item.name : code;
    const category = typeof item.category === "string" ? item.category : "";
    const narrative = typeof item.narrative === "string" ? item.narrative : "";
    const itemCount = asNumber(item.itemCount) ?? 0;
    if (category !== "Tinggi" || code === "N" || itemCount < MIN_HEADLINE_ITEMS) continue;
    lines.push(narrative ? `${name}: ${narrative}` : name);
  }
  return lines;
}

function papiLines(aspects: unknown[]): string[] {
  const lines: string[] = [];
  for (const row of aspects) {
    const item = asRecord(row);
    if (!item) continue;
    const score = asNumber(item.score);
    if (score === null || score < 6) continue;
    const code = typeof item.code === "string" ? item.code : "";
    const name = typeof item.name === "string" ? item.name : "";
    const note = typeof item.note === "string" ? item.note : "";
    lines.push(note ? `${code} — ${name}: ${note}` : `${code} — ${name}`);
  }
  return lines;
}

function msaiLines(skills: unknown[]): string[] {
  const lines: string[] = [];
  for (const row of skills) {
    const item = asRecord(row);
    if (!item || typeof item.name !== "string") continue;
    const gap = asNumber(item.gap);
    if (gap === null || gap > 0) continue;
    lines.push(item.name);
  }
  return lines;
}

function mbtiFromDetail(percent: unknown, stored: string[]): string[] {
  const record = asRecord(percent);
  if (!record) return stored.filter((line) => isPositiveTrait(line));
  const scores: Record<string, number> = {};
  for (const [pole, value] of Object.entries(record)) {
    const score = asNumber(value);
    if (score !== null) scores[pole] = score;
  }
  return mbtiStrengthLines(scores);
}

/**
 * Heading copy for /hasil. Cognitive numbers come from the stored scores, so an
 * older row that saved "IQ 59" inside strengths still renders under Ringkasan.
 */
export function presentStrengths(input: {
  testCode: string;
  strengths?: readonly string[] | null;
  detail?: unknown;
}): StrengthPresentation {
  const stored = linesOf(input.strengths);
  const detail = asRecord(input.detail);
  const kind = kindOf(input.detail, input.testCode);

  if (kind === "wpt") {
    const iq = asNumber(detail?.iq);
    const label = typeof detail?.label === "string" ? detail.label : "";
    if (iq !== null) return wptLines(iq, label);
    return wptFromStored(stored);
  }

  if (kind === "ist") {
    const ra = asNumber(detail?.raScore);
    const zr = asNumber(detail?.zrScore);
    if (ra !== null && zr !== null) return istLines(ra, zr);
    return { strengths: [], summary: stored.filter((line) => /\b\d+\s*\/\s*20\b/.test(line)) };
  }

  if (kind === "msdt") {
    const category = asRecord(detail?.orientationCategory) ?? {};
    return { strengths: msdtLines(category, stored), summary: [] };
  }

  if (kind === "bigfive" && Array.isArray(detail?.dimensions)) {
    return { strengths: bigFiveLines(detail.dimensions), summary: [] };
  }

  if (kind === "papi" && Array.isArray(detail?.aspects)) {
    return { strengths: papiLines(detail.aspects), summary: [] };
  }

  if (kind === "msai" && Array.isArray(detail?.skills)) {
    return { strengths: msaiLines(detail.skills), summary: [] };
  }

  if (kind === "mbti") {
    return { strengths: mbtiFromDetail(detail?.percent, stored), summary: [] };
  }

  if (kind === "enneagram") {
    return { strengths: positiveTraitLines(stored), summary: [] };
  }

  if (kind === "talents_mapping") {
    return { strengths: stored.filter((line) => !isLowBandLabel(line)), summary: [] };
  }

  return { strengths: stored.filter((line) => isPositiveTrait(line)), summary: [] };
}
