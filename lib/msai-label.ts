/** MSAI heading text for /hasil. Built from stored numbers, never from result_label. */

export type MsaiQuadrantScore = { name: string; score: number };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/** Highest quadrants, tied scores kept, names in locale order. */
export function msaiQuadrantLeaders(scores: unknown): MsaiQuadrantScore[] {
  const record = asRecord(scores);
  if (!record) return [];
  const ranked = Object.entries(record)
    .map(([name, score]) => ({ name, score: asScore(score) }))
    .filter((row): row is MsaiQuadrantScore => row.score !== null)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  if (ranked.length === 0) return [];
  const top = ranked[0].score.toFixed(2);
  return ranked.filter((row) => row.score.toFixed(2) === top);
}

function scoresFromDetail(detail: unknown): unknown {
  return asRecord(detail)?.quadrantScores;
}

/**
 * Badge under the MSAI result type. Older rows stored one decimal in result_label
 * ("Adhocracy · 1.2"); the page must print the quadrant number with two decimals.
 */
export function msaiResultBadge(result: {
  result_label?: string | null;
  raw_scores?: unknown;
  interpretation?: { detail?: unknown } | null;
}): string {
  const fromDetail = msaiQuadrantLeaders(scoresFromDetail(result.interpretation?.detail));
  const leaders = fromDetail.length > 0 ? fromDetail : msaiQuadrantLeaders(result.raw_scores);
  if (leaders.length === 0) return result.result_label?.trim() || "MSAI";
  const score = leaders[0].score.toFixed(2);
  if (leaders.length > 1) return `Seri · ${leaders.map((row) => row.name).join(", ")} · ${score}`;
  return `${leaders[0].name} · ${score}`;
}
