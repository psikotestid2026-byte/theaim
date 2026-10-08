/**
 * IST scoring: 9 subtests → RW → SW (norma usia 21–40) → total SW → IQ.
 * Item keys come from test_items.scoring_meta in the database.
 * Norm tables are passed in (loaded from scoring_configs and test_norms). This module does not read the database.
 */
import { itemMeta, type ItemMeta } from "./item-meta";
import {
  IST_AGE_GROUPS,
  IST_SUBTEST_CODES,
  type IstAgeGroup,
  type IstIqCategory,
  type IstScoringTables,
  type IstSubtestCode,
} from "../ist-types";

export { IST_AGE_GROUPS, IST_SUBTEST_CODES };
export type { IstAgeGroup, IstSubtestCode, IstScoringTables };

/** Shown on every IST result while only the 21–40 norm table is available. */
export const IST_NORM_NOTE = "Norma usia 21–40 digunakan";

export function istSubtestOf(item: { section?: string | null; scoring_meta?: unknown }): IstSubtestCode | null {
  const fromMeta = itemMeta(item).subtest;
  const code = (typeof fromMeta === "string" ? fromMeta : item.section ?? "").trim().toUpperCase();
  return (IST_SUBTEST_CODES as readonly string[]).includes(code) ? (code as IstSubtestCode) : null;
}

export function normalizeGeAnswer(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  return String(raw)
    .toLowerCase()
    .replace(/[-–—_/]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** GE (Gemeinsamkeiten): 2 for the abstract category, 1 for the weaker category, otherwise 0. */
export function geItemPoints(meta: ItemMeta, raw: unknown): 0 | 1 | 2 {
  const answer = normalizeGeAnswer(raw);
  if (!answer) return 0;
  const two = (meta.ge_answers?.["2"] ?? []).map(normalizeGeAnswer);
  if (two.includes(answer)) return 2;
  const one = (meta.ge_answers?.["1"] ?? []).map(normalizeGeAnswer);
  return one.includes(answer) ? 1 : 0;
}

/** RA/ZR: the paper answer sheet marks digits, so order (and repeats) do not matter. */
export function digitAnswerIsCorrect(meta: ItemMeta, raw: unknown): boolean {
  if (raw === undefined || raw === null) return false;
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) return false;
  const want = [...new Set((meta.accepted_digits ?? String(meta.key ?? "").split("")).filter((d) => /^\d$/.test(d)))].sort();
  const got = [...new Set(text.split(""))].sort();
  return want.length > 0 && got.length === want.length && got.every((d, i) => d === want[i]);
}

export function istItemPoints(item: { section?: string | null; scoring_meta?: unknown }, raw: unknown): number {
  const meta = itemMeta(item);
  const code = istSubtestOf(item);
  if (!code || raw === undefined || raw === null || String(raw).trim() === "") return 0;
  if (code === "GE") return geItemPoints(meta, raw);
  if (code === "RA" || code === "ZR") return digitAnswerIsCorrect(meta, raw) ? 1 : 0;
  return typeof meta.key === "string" && String(raw) === meta.key ? 1 : 0;
}

export function geRawToRw(table: readonly number[], raw: number): { rw: number; clamped: boolean } {
  const max = table.length - 1;
  if (raw > max) return { rw: table[max] ?? 0, clamped: true };
  return { rw: table[Math.max(0, raw)] ?? 0, clamped: false };
}

export function istAgeGroup(ageYears?: number | null): { group: IstAgeGroup; note: string } {
  if (typeof ageYears === "number" && Number.isFinite(ageYears)) {
    if (ageYears >= 21 && ageYears <= 40) {
      const group = IST_AGE_GROUPS[Math.min(3, Math.floor((ageYears - 21) / 5))];
      return { group, note: `${IST_NORM_NOTE} (kelompok ${group}).` };
    }
    const group = ageYears < 21 ? "21-25" : "36-40";
    return { group, note: `Usia ${ageYears} di luar tabel; ${IST_NORM_NOTE.toLowerCase()} (kelompok ${group}).` };
  }
  return { group: "21-25", note: `Usia peserta tidak tercatat; ${IST_NORM_NOTE.toLowerCase()} (kelompok 21-25).` };
}

export function istRwToSw(
  tables: IstScoringTables,
  group: IstAgeGroup,
  code: IstSubtestCode,
  rw: number,
): { sw: number; filled: boolean } {
  const table = tables.rwToSw[group]?.[code] ?? [];
  const index = Math.max(0, Math.min(20, rw));
  const value = table[index];
  if (typeof value === "number") return { sw: value, filled: false };
  for (let i = index - 1; i >= 0; i--) {
    const lower = table[i];
    if (typeof lower === "number") return { sw: lower, filled: true };
  }
  return { sw: table.find((entry): entry is number => typeof entry === "number") ?? 0, filled: true };
}

export function istTotalSw(tables: IstScoringTables, group: IstAgeGroup, totalRw: number): number {
  const ranges = tables.gesamt[group] ?? [];
  const hit = ranges.find(([lo, hi]) => totalRw >= lo && totalRw <= hi);
  if (hit) return hit[2];
  if (ranges.length === 0) return 0;
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  return totalRw < sorted[0][0] ? sorted[0][2] : sorted[sorted.length - 1][2];
}

/** SW→IQ from the loaded table. SWs between table rows use the next lower row. */
export function istSwToIq(tables: IstScoringTables, sw: number): { iq: number; percentile: number } {
  let row = tables.swToIq[0] ?? [0, 0, 0];
  for (const candidate of tables.swToIq) {
    if (candidate[0] <= sw) row = candidate;
  }
  return { iq: row[1] ?? 0, percentile: row[2] ?? 0 };
}

export function istIqCategory(categories: readonly IstIqCategory[], iq: number): string {
  for (const row of categories) {
    const min = row.iq_min ?? -Infinity;
    const max = row.iq_max ?? Infinity;
    if (iq >= min && iq <= max) return row.label;
  }
  return "";
}

export type IstSubtestScore = {
  code: IstSubtestCode;
  name: string;
  items: number;
  answered: number;
  raw: number;
  rw: number;
  sw: number;
};

export type IstScore = {
  subtests: IstSubtestScore[];
  totalRw: number;
  totalSw: number;
  iq: number;
  percentile: number;
  category: string;
  ageGroup: IstAgeGroup;
  provisionalItems: number[];
  notes: string[];
};

export function calculateIstScore(
  items: { id: number; item_order: number; section?: string | null; scoring_meta?: unknown }[],
  responses: Record<number, string>,
  tables: IstScoringTables,
  options: { ageYears?: number | null } = {},
): IstScore {
  const { group, note } = istAgeGroup(options.ageYears);
  const notes = [note];
  const buckets = new Map<IstSubtestCode, { items: number; answered: number; raw: number }>();
  for (const code of IST_SUBTEST_CODES) buckets.set(code, { items: 0, answered: 0, raw: 0 });
  const provisionalItems: number[] = [];
  const provisional = new Set(tables.provisionalItems);
  for (const item of items) {
    const code = istSubtestOf(item);
    if (!code) continue;
    const bucket = buckets.get(code)!;
    bucket.items += 1;
    const raw = responses[item.id];
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") bucket.answered += 1;
    bucket.raw += istItemPoints(item, raw);
    if (itemMeta(item).key_provisional || provisional.has(item.item_order)) provisionalItems.push(item.item_order);
  }
  const names = new Map(tables.subtests.map((row) => [row.code, row.name]));
  const subtests: IstSubtestScore[] = IST_SUBTEST_CODES.map((code) => {
    const bucket = buckets.get(code)!;
    let rw = bucket.raw;
    if (code === "GE") {
      const converted = geRawToRw(tables.geRawToRw, bucket.raw);
      rw = converted.rw;
      if (converted.clamped) {
        notes.push(`Skor kasar GE ${bucket.raw} di atas tabel konversi (maks. ${tables.geRawToRw.length - 1}); dipakai nilai tertinggi tabel.`);
      }
    }
    const { sw, filled } = istRwToSw(tables, group, code, rw);
    if (filled) notes.push(`Sel norma ${code} RW ${rw} pada sumber tidak terbaca; dipakai SW untuk RW di bawahnya.`);
    return { code, name: names.get(code) ?? code, items: bucket.items, answered: bucket.answered, raw: bucket.raw, rw, sw };
  });
  const missing = subtests.filter((row) => row.items === 0).map((row) => row.code);
  if (missing.length) notes.push(`Subtes tanpa butir di bank soal: ${missing.join(", ")}.`);
  const totalRw = subtests.reduce((sum, row) => sum + row.rw, 0);
  const totalSw = istTotalSw(tables, group, totalRw);
  const { iq, percentile } = istSwToIq(tables, totalSw);
  provisionalItems.sort((a, b) => a - b);
  const uniqueProvisional = [...new Set(provisionalItems)];
  if (uniqueProvisional.length) {
    notes.push(
      `${uniqueProvisional.length} butir memakai kunci sementara karena sumber kunci berbeda (no. ${uniqueProvisional.join(", ")}). Hasil perlu ditinjau psikolog.`,
    );
  }
  return {
    subtests,
    totalRw,
    totalSw,
    iq,
    percentile,
    category: istIqCategory(tables.categories, iq),
    ageGroup: group,
    provisionalItems: uniqueProvisional,
    notes,
  };
}
