import { isDiscAnswerComplete } from "@/lib/scoring/disc-answer";
import { isTypedAnswerItem } from "@/lib/scoring/item-meta";

export type AnswerWidget = "disc" | "likert" | "choice" | "text";

type OptionLike = { value?: string };

const LIKERT_TESTS = new Set(["bigfive", "enneagram", "talents_mapping"]);

type WidgetItem = { section?: string | null; options?: OptionLike[] | string; item_order?: number; scoring_meta?: unknown };

/**
 * Widget is chosen from the test code (and MSAI career items), not from how
 * many options the row has. Five numbered choices on WPT/IST are still
 * multiple choice. Items whose scoring_meta.answer_type is text/number take a
 * typed answer (WPT isian, IST GE/RA/ZR).
 */
export function widgetForItem(testCode: string, item: WidgetItem): AnswerWidget {
  if (isTypedAnswerItem(item)) return "text";
  const code = testCode.toLowerCase();
  const section = (item.section ?? "").toLowerCase();
  if (code === "disc" || section === "disc") return "disc";
  if (code === "msai") {
    if (item.item_order === 74 || item.item_order === 75 || section === "career") return "choice";
    return "likert";
  }
  if (LIKERT_TESTS.has(code)) return "likert";
  return "choice";
}

export function isAnswerComplete(testCode: string, item: WidgetItem, value: string | undefined): boolean {
  if (!value || !value.trim()) return false;
  if (widgetForItem(testCode, item) === "disc") return isDiscAnswerComplete(value);
  return true;
}
