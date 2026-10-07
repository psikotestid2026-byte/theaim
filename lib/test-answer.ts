import { itemOptions } from "@/lib/scoring/answer-map";
import { isDiscAnswerComplete, parseDiscAnswer } from "@/lib/scoring/disc-answer";
import { widgetForItem } from "@/lib/test-widget";
import type { TestItem } from "@/types/db";

/**
 * An answer may be stored only when the item belongs to this test and the
 * value is one of that item's options. DISC stores a P/K pair, not one value.
 */
export function isAllowedAnswer(testCode: string, item: TestItem, answer: string): boolean {
  const options = itemOptions(item);
  if (!answer || options.length === 0) return false;
  if (widgetForItem(testCode, item) === "disc") {
    if (!isDiscAnswerComplete(answer)) return false;
    const parsed = parseDiscAnswer(answer);
    return parsed.P !== null && parsed.K !== null && parsed.P < options.length && parsed.K < options.length;
  }
  return options.some((option) => option.value === answer);
}
