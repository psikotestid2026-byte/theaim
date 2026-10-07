import { isDiscAnswerComplete } from "@/lib/scoring/disc-answer";

export type AnswerWidget = "disc" | "likert" | "choice";

type OptionLike = { value?: string };

const LIKERT_TESTS = new Set(["bigfive", "enneagram", "talents_mapping"]);

/**
 * Widget is chosen from the test code (and MSAI career items), not from how
 * many options the row has. Five numbered choices on WPT/IST are still
 * multiple choice.
 */
export function widgetForItem(
  testCode: string,
  item: { section?: string | null; options?: OptionLike[] | string; item_order?: number },
): AnswerWidget {
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

export function isAnswerComplete(
  testCode: string,
  item: { section?: string | null; options?: OptionLike[] | string; item_order?: number },
  value: string | undefined,
): boolean {
  if (!value) return false;
  if (widgetForItem(testCode, item) === "disc") return isDiscAnswerComplete(value);
  return true;
}
