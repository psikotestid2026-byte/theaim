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

type Bucket = Record<BigFiveDimension, { sum: number; count: number }>;

function emptyBuckets(): Bucket {
  return {
    E: { sum: 0, count: 0 },
    A: { sum: 0, count: 0 },
    C: { sum: 0, count: 0 },
    N: { sum: 0, count: 0 },
    O: { sum: 0, count: 0 },
  };
}

function finalize(scores: Bucket, totalAnswers: number) {
  const finalResults: Record<string, { raw: number; max: number; percent: number; category: string; narrative: string }> = {};
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
  let answered = 0;
  for (const item of items) {
    const rawValue = responses[item.id];
    if (!rawValue) continue;
    const rawScore = parseLikert(rawValue);
    if (rawScore === null) continue;
    const key = resolveBigFiveKey(item);
    const points = key.reversed ? 6 - rawScore : rawScore;
    scores[key.dimension].sum += points;
    scores[key.dimension].count += 1;
    answered += 1;
  }
  return finalize(scores, answered);
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
  return finalize(scores, Object.keys(answers || {}).length);
}
