import { itemOptions } from "@/lib/scoring/answer-map";
import { isDiscAnswerComplete, parseDiscAnswer } from "@/lib/scoring/disc-answer";
import { itemMeta, TYPED_ANSWER_MAX } from "@/lib/scoring/item-meta";
import { widgetForItem } from "@/lib/test-widget";
import type { TestItem } from "@/types/db";

/**
 * An answer may be stored only when the item belongs to this test and the
 * value is one of that item's options. DISC stores a P/K pair, not one value.
 * Typed items (WPT isian, IST GE/RA/ZR) accept short text; number items accept digits only.
 */
export function isAllowedAnswer(testCode: string, item: TestItem, answer: string): boolean {
  if (widgetForItem(testCode, item) === "text") {
    const text = answer?.trim() ?? "";
    if (!text || text.length > TYPED_ANSWER_MAX) return false;
    return itemMeta(item).answer_type === "number" ? /^\d{1,6}$/.test(text) : true;
  }
  const options = itemOptions(item);
  if (!answer || options.length === 0) return false;
  if (widgetForItem(testCode, item) === "disc") {
    if (!isDiscAnswerComplete(answer)) return false;
    const parsed = parseDiscAnswer(answer);
    return parsed.P !== null && parsed.K !== null && parsed.P < options.length && parsed.K < options.length;
  }
  return options.some((option) => option.value === answer);
}
