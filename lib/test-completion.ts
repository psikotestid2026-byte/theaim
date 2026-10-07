import { isAnswerComplete } from "@/lib/test-widget";

type CompletionItem = {
  id: number;
  section?: string | null;
  options?: { value?: string }[] | string;
  item_order?: number;
};

export function unansweredItemIds(
  testCode: string,
  items: CompletionItem[],
  answers: Record<number, string>,
): number[] {
  return items.filter((item) => !isAnswerComplete(testCode, item, answers[item.id])).map((item) => item.id);
}

export function unansweredCount(
  testCode: string,
  items: CompletionItem[],
  answers: Record<number, string>,
): number {
  return unansweredItemIds(testCode, items, answers).length;
}
