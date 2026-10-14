/**
 * Parses IST scoring_configs.config_data and test_norms rows.
 * Pure: no database import. The memorize word list is parsed only by
 * parseIstMemorizeList and is never copied onto the public subtest objects.
 */
import {
  IST_AGE_GROUPS,
  IST_SUBTEST_CODES,
  type IstAgeGroup,
  type IstExample,
  type IstIqCategory,
  type IstMemorizeList,
  type IstScheduleEntry,
  type IstScoringTables,
  type IstSubtestCode,
  type IstSubtestPublic,
} from "./ist-types";

const SUBTEST_CODES = new Set<string>(IST_SUBTEST_CODES);

export type IstNormRow = {
  age_group: string | null;
  raw_score: string;
  norm_score: string;
  label: string;
  description?: string | null;
};

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asConfig(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      return asObject(JSON.parse(value) as unknown);
    } catch {
      return null;
    }
  }
  return asObject(value);
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseExamples(value: unknown): IstExample[] {
  if (!Array.isArray(value)) return [];
  const examples: IstExample[] = [];
  for (const row of value) {
    const item = asObject(row);
    if (!item || typeof item.key !== "string" || !item.key.trim()) continue;
    const example: IstExample = { key: item.key };
    if (typeof item.stem === "string") example.stem = item.stem;
    if (Array.isArray(item.options) && item.options.every((option) => typeof option === "string")) {
      example.options = item.options;
    }
    examples.push(example);
  }
  return examples;
}

function scheduleFromRow(item: Record<string, unknown>): IstScheduleEntry | null {
  const code = String(item.code ?? "").trim().toUpperCase();
  if (!SUBTEST_CODES.has(code)) return null;
  const timeLimitSec = finiteNumber(item.timeLimitSec);
  const from = finiteNumber(item.from);
  const to = finiteNumber(item.to);
  if (timeLimitSec === null || from === null || to === null || timeLimitSec <= 0) return null;
  const memorizeSec = finiteNumber(item.memorizeSec);
  return {
    code,
    name: typeof item.name === "string" && item.name.trim() ? item.name : code,
    from,
    to,
    timeLimitSec,
    ...(memorizeSec !== null && memorizeSec > 0 ? { memorizeSec } : {}),
  };
}

/** Codes, names, and clocks. Instructions and the memorize list are ignored. */
export function parseIstSchedule(value: unknown): IstScheduleEntry[] | null {
  const rows = Array.isArray(value) ? value : asConfig(value)?.subtests;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const schedule: IstScheduleEntry[] = [];
  for (const row of rows) {
    const item = asObject(row);
    const parsed = item ? scheduleFromRow(item) : null;
    if (!parsed) return null;
    schedule.push(parsed);
  }
  return schedule;
}

/**
 * Runner payload. Copies instructions, examples, and exampleImage.
 * Does not copy memorizeList, even when the source object has one.
 */
export function parseIstPublicSubtests(value: unknown): IstSubtestPublic[] | null {
  const rows = asConfig(value)?.subtests;
  if (!Array.isArray(rows)) return null;
  const schedule = parseIstSchedule(rows);
  if (!schedule) return null;
  return schedule.map((entry, index) => {
    const item = asObject(rows[index]) ?? {};
    const exampleImage = typeof item.exampleImage === "string" && item.exampleImage.startsWith("/")
      ? item.exampleImage
      : undefined;
    return {
      ...entry,
      instructions: typeof item.instructions === "string" ? item.instructions : "",
      examples: parseExamples(item.examples),
      ...(exampleImage ? { exampleImage } : {}),
    };
  });
}

/** ME word list only. Callers must not send this outside the memorize phase. */
export function parseIstMemorizeList(value: unknown): IstMemorizeList | null {
  const list = asObject(value);
  if (!list) return null;
  const out: IstMemorizeList = {};
  for (const [group, words] of Object.entries(list)) {
    if (!group.trim() || !Array.isArray(words) || words.length === 0 || words.some((word) => typeof word !== "string")) {
      return null;
    }
    out[group] = words;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function emptyRwToSw(): IstScoringTables["rwToSw"] {
  const tables = {} as IstScoringTables["rwToSw"];
  for (const group of IST_AGE_GROUPS) {
    tables[group] = {};
    for (const code of IST_SUBTEST_CODES) tables[group][code] = Array.from({ length: 21 }, () => null);
  }
  return tables;
}

function emptyGesamt(): IstScoringTables["gesamt"] {
  const tables = {} as IstScoringTables["gesamt"];
  for (const group of IST_AGE_GROUPS) tables[group] = [];
  return tables;
}

function parseCategories(value: unknown): IstIqCategory[] {
  if (!Array.isArray(value)) return [];
  const categories: IstIqCategory[] = [];
  for (const row of value) {
    const item = asObject(row);
    if (!item || typeof item.label !== "string" || !item.label.trim()) continue;
    const category: IstIqCategory = { label: item.label };
    const iqMin = finiteNumber(item.iq_min);
    const iqMax = finiteNumber(item.iq_max);
    if (iqMin !== null) category.iq_min = iqMin;
    if (iqMax !== null) category.iq_max = iqMax;
    categories.push(category);
  }
  return categories;
}

function isAgeGroup(value: string | null): value is IstAgeGroup {
  return IST_AGE_GROUPS.includes(value as IstAgeGroup);
}

function isSubtestCode(value: string): value is IstSubtestCode {
  return SUBTEST_CODES.has(value);
}

/**
 * Builds the scoring tables from config JSON plus flat test_norms rows.
 * Expected norm shapes (already used on staging):
 * - label SW, age_group 21-25|26-30|31-35|36-40, raw_score "{CODE}:{rw}", norm_score SW
 * - label SW, same age groups, raw_score "GESAMT:{lo}-{hi}", norm_score total SW
 * - label IQ, age_group SW_IQ, raw_score SW, norm_score IQ, description "persentil {n}"
 * A missing RW cell stays null so scoring can fall back to the next lower RW.
 */
export function parseIstScoringTables(config: unknown, rows: readonly IstNormRow[]): IstScoringTables | null {
  const data = asConfig(config);
  const schedule = data ? parseIstSchedule(data.subtests) : null;
  const geRawToRw = Array.isArray(data?.ge_raw_to_rw)
    ? data.ge_raw_to_rw.filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    : [];
  if (!schedule || geRawToRw.length === 0) return null;

  const rwToSw = emptyRwToSw();
  const gesamt = emptyGesamt();
  const swToIq: number[][] = [];

  for (const row of rows) {
    const sw = finiteNumber(row.norm_score);
    if (sw === null) continue;
    if (row.label === "IQ" && row.age_group === "SW_IQ") {
      const standard = finiteNumber(row.raw_score);
      const percentile = Number(/^persentil\s+(\d+)/i.exec(row.description ?? "")?.[1] ?? Number.NaN);
      if (standard === null || !Number.isFinite(percentile)) continue;
      swToIq.push([standard, sw, percentile]);
      continue;
    }
    if (row.label !== "SW" || !isAgeGroup(row.age_group)) continue;
    const total = /^GESAMT:(\d+)-(\d+)$/.exec(row.raw_score);
    if (total) {
      gesamt[row.age_group].push([Number(total[1]), Number(total[2]), sw]);
      continue;
    }
    const cell = /^([A-Z]{2}):(\d+)$/.exec(row.raw_score);
    if (!cell || !isSubtestCode(cell[1])) continue;
    const rw = Number(cell[2]);
    if (rw < 0 || rw > 20) continue;
    rwToSw[row.age_group][cell[1]][rw] = sw;
  }

  swToIq.sort((a, b) => a[0] - b[0]);
  for (const group of IST_AGE_GROUPS) gesamt[group].sort((a, b) => a[0] - b[0]);

  const hasCell = IST_AGE_GROUPS.some((group) =>
    IST_SUBTEST_CODES.some((code) => rwToSw[group][code].some((value) => value !== null)),
  );
  if (!hasCell || swToIq.length === 0) return null;

  const provisional = Array.isArray(data?.provisional_items)
    ? data.provisional_items.map((value) => finiteNumber(value)).filter((value): value is number => value !== null)
    : [];

  return {
    subtests: schedule.map((row) => ({ code: row.code, name: row.name })),
    geRawToRw,
    rwToSw,
    gesamt,
    swToIq,
    categories: parseCategories(data?.iq_categories),
    provisionalItems: provisional,
  };
}
