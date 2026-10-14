import type { TestItem, TestItemOption } from "@/types/db";
import { parseDiscAnswer, type DiscAnswer } from "./disc-answer";

export function itemOptions(item: TestItem): TestItemOption[] {
  const raw = item.options as unknown;
  if (Array.isArray(raw)) return raw as TestItemOption[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as TestItemOption[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** RuangTes scores by 0-based question index (order_number - 1). */
export function orderIndex(item: TestItem): number {
  return item.item_order - 1;
}

export function choiceLabel(item: TestItem, raw: string): string {
  const match = itemOptions(item).find((opt) => opt.value === raw);
  return match?.label ?? raw;
}

export function indexAnswers(
  items: TestItem[],
  responses: Record<number, string>,
  mode: "label" | "value",
): Record<number, string> {
  const out: Record<number, string> = {};
  for (const item of items) {
    const raw = responses[item.id];
    if (raw === undefined || raw === null || raw === "") continue;
    out[orderIndex(item)] = mode === "label" ? choiceLabel(item, raw) : raw;
  }
  return out;
}

export function discIndexAnswers(
  items: TestItem[],
  responses: Record<number, string>,
): Record<number, DiscAnswer> {
  const out: Record<number, DiscAnswer> = {};
  for (const item of items) {
    const raw = responses[item.id];
    if (!raw) continue;
    out[orderIndex(item)] = parseDiscAnswer(raw);
  }
  return out;
}
