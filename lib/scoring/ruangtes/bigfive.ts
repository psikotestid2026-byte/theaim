import { BIG_FIVE_NARRATIVES } from "./bigfive-narratives";

export type BigFiveDimension = "E" | "A" | "C" | "N" | "O";

export type BigFiveItemKey = {
  text: string;
  dimension: BigFiveDimension;
  reversed: boolean;
};

/**
 * Dimension and reverse-keying follow the stored Indonesian stems, not the
 * BFI-44 column positions. RuangTes scores by position and its own docs say
 * these placeholder sentences were never aligned to that key (item 1 is
 * anxiety, item 2 is sociability).
 */
export const BIGFIVE_ITEMS: readonly BigFiveItemKey[] = [
  { text: "Saya mudah cemas", dimension: "N", reversed: false },
  { text: "Saya ramah dan mudah bergaul", dimension: "E", reversed: false },
  { text: "Saya suka menjaga kerapian", dimension: "C", reversed: false },
  { text: "Saya mudah marah", dimension: "N", reversed: false },
  { text: "Saya memiliki imajinasi yang kaya", dimension: "O", reversed: false },
  { text: "Saya tenang dalam menghadapi tekanan", dimension: "N", reversed: true },
  { text: "Saya cenderung pendiam", dimension: "E", reversed: true },
  { text: "Saya bisa ceroboh", dimension: "C", reversed: true },
  { text: "Saya sangat sabar", dimension: "A", reversed: false },
  { text: "Saya tidak terlalu tertarik pada seni", dimension: "O", reversed: true },
  { text: "Saya sering khawatir", dimension: "N", reversed: false },
  { text: "Saya penuh energi", dimension: "E", reversed: false },
  { text: "Saya dapat diandalkan", dimension: "C", reversed: false },
  { text: "Saya jarang sedih", dimension: "N", reversed: true },
  { text: "Saya ingin tahu banyak hal", dimension: "O", reversed: false },
  { text: "Saya mudah stres", dimension: "N", reversed: false },
  { text: "Saya suka bertemu orang baru", dimension: "E", reversed: false },
  { text: "Saya cenderung tidak terorganisir", dimension: "C", reversed: true },
  { text: "Saya mudah tersinggung", dimension: "N", reversed: false },
  { text: "Saya suka refleksi mendalam", dimension: "O", reversed: false },
  { text: "Saya stabil secara emosional", dimension: "N", reversed: true },
  { text: "Saya suka jadi pusat perhatian", dimension: "E", reversed: false },
  { text: "Saya pekerja keras", dimension: "C", reversed: false },
  { text: "Saya jarang merasa sedih", dimension: "N", reversed: true },
  { text: "Saya kreatif dan imajinatif", dimension: "O", reversed: false },
  { text: "Saya mudah panik", dimension: "N", reversed: false },
  { text: "Saya suka mengobrol", dimension: "E", reversed: false },
  { text: "Saya tepat waktu dan terencana", dimension: "C", reversed: false },
  { text: "Saya mudah kesal", dimension: "N", reversed: false },
  { text: "Saya menghargai pengalaman baru", dimension: "O", reversed: false },
  { text: "Saya jarang gugup", dimension: "N", reversed: true },
  { text: "Saya antusias", dimension: "E", reversed: false },
  { text: "Saya efisien", dimension: "C", reversed: false },
  { text: "Saya sering merasa tidak aman", dimension: "N", reversed: false },
  { text: "Saya memiliki rasa seni yang tinggi", dimension: "O", reversed: false },
  { text: "Saya mudah takut", dimension: "N", reversed: false },
  { text: "Saya suka bersosialisasi", dimension: "E", reversed: false },
  { text: "Saya membuat rencana dan mengikutinya", dimension: "C", reversed: false },
  { text: "Saya suka hal-hal yang kompleks", dimension: "O", reversed: false },
  { text: "Saya jarang cemas", dimension: "N", reversed: true },
  { text: "Saya penuh semangat", dimension: "E", reversed: false },
  { text: "Saya mudah terganggu", dimension: "C", reversed: true },
  { text: "Saya memiliki imajinasi yang aktif", dimension: "O", reversed: false },
  { text: "Saya memiliki pemahaman yang baik dalam seni, musik, atau sastra.", dimension: "O", reversed: false },
];

const VALUE_MAP: Record<string, number> = {
  "Sangat Tidak Setuju": 1,
  "Tidak Setuju": 2,
  Netral: 3,
  Setuju: 4,
  "Sangat Setuju": 5,
  "Sangat Tidak Sesuai": 1,
  "Tidak Sesuai": 2,
  Sesuai: 4,
  "Sangat Sesuai": 5,
};

const DIMENSIONS = new Set<BigFiveDimension>(["E", "A", "C", "N", "O"]);

export function normalizeBigFiveText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.]+$/g, "");
}

function keyFromMeta(meta: unknown): BigFiveItemKey | null {
  if (!meta || typeof meta !== "object") return null;
  const row = meta as { dimension?: unknown; reversed?: unknown; text?: unknown };
  if (typeof row.dimension !== "string" || typeof row.reversed !== "boolean") return null;
  const dimension = row.dimension.toUpperCase();
  if (!DIMENSIONS.has(dimension as BigFiveDimension)) return null;
  return {
    text: typeof row.text === "string" ? row.text : "",
    dimension: dimension as BigFiveDimension,
    reversed: row.reversed,
  };
}

export function resolveBigFiveKey(item: {
  item_order: number;
  question_text?: string | null;
  scoring_meta?: unknown;
}): BigFiveItemKey {
  const fromMeta = keyFromMeta(item.scoring_meta);
  if (fromMeta) return fromMeta;
  const text = normalizeBigFiveText(item.question_text ?? "");
  const byText = BIGFIVE_ITEMS.find((row) => normalizeBigFiveText(row.text) === text);
  if (byText) return byText;
  return BIGFIVE_ITEMS[item.item_order - 1] ?? BIGFIVE_ITEMS[0];
}

function parseLikert(value: string): number | null {
  const normalizedValue = String(value).trim();
  let rawScore = VALUE_MAP[normalizedValue];
  if (rawScore === undefined && !Number.isNaN(Number(normalizedValue))) {
    rawScore = Number(normalizedValue);
  }
  if (rawScore === undefined || rawScore < 1 || rawScore > 5) return null;
  return rawScore;
}

export const MIN_HEADLINE_ITEMS = 3;

export type BigFiveDimensionRow = {
  raw: number;
  max: number;
  percent: number;
  category: string;
  narrative: string;
  itemCount: number;
};

type Bucket = Record<BigFiveDimension, { sum: number; count: number }>;

function emptyCounts(): Record<BigFiveDimension, number> {
  return { E: 0, A: 0, C: 0, N: 0, O: 0 };
}

function emptyBuckets(): Bucket {
  return {
    E: { sum: 0, count: 0 },
    A: { sum: 0, count: 0 },
    C: { sum: 0, count: 0 },
    N: { sum: 0, count: 0 },
    O: { sum: 0, count: 0 },
  };
}

function finalize(scores: Bucket, totalAnswers: number, bankCounts: Record<BigFiveDimension, number>) {
  const finalResults: Record<string, BigFiveDimensionRow> = {};
  for (const [dim, data] of Object.entries(scores)) {
    const finalMax = data.count * 5;
    const finalPercent = finalMax > 0 ? (data.sum / finalMax) * 100 : 0;
    let category = "Rendah";
    if (finalPercent >= 75) category = "Tinggi";
    else if (finalPercent >= 50) category = "Sedang";
    finalResults[dim] = {
      raw: data.sum,
      max: finalMax,
      percent: parseFloat(finalPercent.toFixed(2)),
      category,
      narrative: BIG_FIVE_NARRATIVES[dim as BigFiveDimension]?.[category as "Tinggi" | "Sedang" | "Rendah"] || "",
      itemCount: bankCounts[dim as BigFiveDimension] ?? 0,
    };
  }
  return {
    completed: true,
    total_answers: totalAnswers,
    submitted_at: new Date().toISOString(),
    dimensions: finalResults,
  };
}

export function calculateBigFiveFromItems(
  items: { id: number; item_order: number; question_text?: string | null; scoring_meta?: unknown }[],
  responses: Record<number, string>,
) {
  const scores = emptyBuckets();
  const bankCounts = emptyCounts();
  let answered = 0;
  for (const item of items) {
    const key = resolveBigFiveKey(item);
    bankCounts[key.dimension] += 1;
    const rawValue = responses[item.id];
    if (!rawValue) continue;
    const rawScore = parseLikert(rawValue);
    if (rawScore === null) continue;
    const points = key.reversed ? 6 - rawScore : rawScore;
    scores[key.dimension].sum += points;
    scores[key.dimension].count += 1;
    answered += 1;
  }
  return finalize(scores, answered, bankCounts);
}

export function calculateBigFiveScore(answers: Record<string, string>) {
  const scores = emptyBuckets();
  for (const [key, value] of Object.entries(answers || {})) {
    const index = parseInt(key, 10);
    if (!Number.isInteger(index)) continue;
    const rawScore = parseLikert(String(value));
    if (rawScore === null) continue;
    const itemKey = BIGFIVE_ITEMS[index];
    if (!itemKey) continue;
    const points = itemKey.reversed ? 6 - rawScore : rawScore;
    scores[itemKey.dimension].sum += points;
    scores[itemKey.dimension].count += 1;
  }
  const bankCounts = emptyCounts();
  for (const item of BIGFIVE_ITEMS) bankCounts[item.dimension] += 1;
  return finalize(scores, Object.keys(answers || {}).length, bankCounts);
}

export function thinBigFiveNote(name: string, itemCount: number): string {
  return `${name} punya ${itemCount} butir, terlalu sedikit untuk dijadikan faktor utama.`;
}

/* ------------------------------------------------------------------ IPIP-BFM-50 */

export const IPIP_FACTORS = [
  { code: "E", name: "Ekstraversi" },
  { code: "A", name: "Keramahan (Agreeableness)" },
  { code: "C", name: "Kesungguhan (Conscientiousness)" },
  { code: "ES", name: "Stabilitas Emosi" },
  { code: "O", name: "Intelek/Imajinasi (Openness)" },
] as const;

export type IpipFactor = (typeof IPIP_FACTORS)[number]["code"];

export const IPIP_NO_NORMS_NOTE =
  "Tanpa norma: skor mentah (10–50), rerata (1–5), dan persen dari skor maksimum. Angka ini bukan perbandingan dengan populasi.";

type IpipMeta = { instrument?: unknown; factor?: unknown; keyed?: unknown };

function ipipKey(meta: unknown): { factor: IpipFactor; keyed: "+" | "-" } | null {
  if (!meta || typeof meta !== "object") return null;
  const row = meta as IpipMeta;
  if (row.instrument !== "IPIP-BFM-50") return null;
  const factor = IPIP_FACTORS.find((f) => f.code === row.factor)?.code;
  if (!factor || (row.keyed !== "+" && row.keyed !== "-")) return null;
  return { factor, keyed: row.keyed };
}

/** True when every item carries an IPIP-BFM-50 key (factor + keyed) in scoring_meta. */
export function isIpipBfm50Bank(items: { scoring_meta?: unknown }[]): boolean {
  return items.length > 0 && items.every((item) => ipipKey(item.scoring_meta) !== null);
}

export type IpipFactorRow = {
  code: IpipFactor;
  name: string;
  raw: number;
  max: number;
  mean: number;
  percent: number;
  answered: number;
  itemCount: number;
};

/** Official IPIP scoring: + keyed 1..5 as is, − keyed 6 − response; factor = sum of its items. */
export function calculateIpipBfm50(
  items: { id: number; scoring_meta?: unknown }[],
  responses: Record<number, string>,
): IpipFactorRow[] {
  const sums = new Map<IpipFactor, { raw: number; answered: number; itemCount: number }>();
  for (const f of IPIP_FACTORS) sums.set(f.code, { raw: 0, answered: 0, itemCount: 0 });
  for (const item of items) {
    const key = ipipKey(item.scoring_meta);
    if (!key) continue;
    const bucket = sums.get(key.factor)!;
    bucket.itemCount += 1;
    const value = responses[item.id];
    const score = value ? parseLikert(value) : null;
    if (score === null) continue;
    bucket.raw += key.keyed === "+" ? score : 6 - score;
    bucket.answered += 1;
  }
  return IPIP_FACTORS.map(({ code, name }) => {
    const { raw, answered, itemCount } = sums.get(code)!;
    const max = answered * 5;
    return {
      code,
      name,
      raw,
      max,
      mean: answered ? Number((raw / answered).toFixed(2)) : 0,
      percent: max ? Number(((raw / max) * 100).toFixed(1)) : 0,
      answered,
      itemCount,
    };
  });
}
