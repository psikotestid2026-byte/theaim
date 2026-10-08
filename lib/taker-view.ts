/**
 * Fields that must never reach the test-taker. Scoring still reads them on the server.
 * Big Five factor/keyed stay; that instrument is public-domain and has no figures.
 */
import { withAssetToken } from "./test-assets";

const SECRET_META_KEYS = [
  "accepted",
  "key",
  "key_letter",
  "key_provisional",
  "candidate_keys",
  "key_note",
  "accepted_digits",
  "ge_answers",
] as const;

const PROVISIONAL_NOTE = /\d+\s+butir memakai kunci sementara[^.]*\.?\s*/gi;

function asObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function stripScoringMeta(meta: unknown): Record<string, unknown> | null {
  const raw = asObject(meta);
  if (!raw) return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if ((SECRET_META_KEYS as readonly string[]).includes(key)) continue;
    out[key] = value;
  }
  return out;
}

function stripOptions(options: unknown): unknown {
  if (typeof options === "string") {
    try {
      return stripOptions(JSON.parse(options) as unknown);
    } catch {
      return options;
    }
  }
  if (!Array.isArray(options)) return options;
  return options.map((option) => {
    if (!option || typeof option !== "object" || Array.isArray(option)) return option;
    const copy = { ...(option as Record<string, unknown>) };
    delete copy.score_key;
    delete copy.score_val;
    return copy;
  });
}

/** Item payload for the runner. Image paths stay as stored; the client appends `t`. */
export function presentTakerItems<T extends { scoring_meta?: unknown; options?: unknown }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    scoring_meta: stripScoringMeta(item.scoring_meta),
    options: stripOptions(item.options),
  }));
}

function rewriteAssetStrings(value: unknown, token: string): unknown {
  if (typeof value === "string") return withAssetToken(value, token) ?? value;
  if (Array.isArray(value)) return value.map((entry) => rewriteAssetStrings(entry, token));
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if ((SECRET_META_KEYS as readonly string[]).includes(key) || key === "provisionalItems") continue;
    out[key] = rewriteAssetStrings(entry, token);
  }
  return out;
}

function scrubProvisionalText(text: string): string {
  return text.replace(PROVISIONAL_NOTE, "").replace(/\s{2,}/g, " ").trim();
}

/**
 * Result shown on /hasil. Drops provisional-key item numbers and appends the
 * result token to any figure URL embedded in the payload.
 */
export function presentTakerResult<T extends { interpretation?: unknown }>(result: T, resultToken: string): T {
  const interpretation = result.interpretation;
  if (!interpretation || typeof interpretation !== "object") return result;
  const copy = { ...(interpretation as Record<string, unknown>) };
  if (typeof copy.description === "string") copy.description = scrubProvisionalText(copy.description);
  if (copy.detail && typeof copy.detail === "object") {
    const detail = { ...(copy.detail as Record<string, unknown>) };
    delete detail.provisionalItems;
    if (Array.isArray(detail.notes)) {
      detail.notes = detail.notes
        .filter((line): line is string => typeof line === "string" && !/kunci sementara/i.test(line))
        .map((line) => scrubProvisionalText(line));
    }
    copy.detail = rewriteAssetStrings(detail, resultToken);
  }
  return { ...result, interpretation: copy };
}
