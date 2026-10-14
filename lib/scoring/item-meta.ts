/** Safe readers for test_items.scoring_meta. IST/WPT keys are database content, not source. */
export type ItemMeta = {
  subtest?: string;
  answer_type?: "choice" | "text" | "number";
  match?: "choice" | "number" | "numbers_set" | "text";
  accepted?: string[];
  key?: string;
  key_letter?: string;
  key_provisional?: boolean;
  candidate_keys?: string[];
  key_note?: string;
  accepted_digits?: string[];
  ge_answers?: { "2"?: string[]; "1"?: string[] };
  image?: string;
  options_image?: string;
  instrument?: string;
  factor?: string;
  keyed?: "+" | "-";
};

export function itemMeta(item: { scoring_meta?: unknown }): ItemMeta {
  const raw = item.scoring_meta;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as ItemMeta) : {};
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as ItemMeta) : {};
}

/** Free-text answer (typed by the participant) instead of a chosen option. */
export function isTypedAnswerItem(item: { scoring_meta?: unknown }): boolean {
  const type = itemMeta(item).answer_type;
  return type === "text" || type === "number";
}

export function itemImage(item: { scoring_meta?: unknown }): string | null {
  const image = itemMeta(item).image;
  return typeof image === "string" && image.startsWith("/") ? image : null;
}

export function itemOptionsImage(item: { scoring_meta?: unknown }): string | null {
  const image = itemMeta(item).options_image;
  return typeof image === "string" && image.startsWith("/") ? image : null;
}

/** Longest answer a participant may type for a free-text item. */
export const TYPED_ANSWER_MAX = 80;
