import { isDiscAnswerComplete } from "@/lib/scoring/disc-answer";

export type AnswerWidget = "disc" | "likert" | "choice";

type OptionLike = { value?: string };

/** Which control TestEngine should render. Mirrors RuangTes QuestionStage, with Likert for 1–5 scales. */
export function widgetForItem(
  testCode: string,
  item: { section?: string | null; options?: OptionLike[] | string },
): AnswerWidget {
  const code = testCode.toLowerCase();
  const section = (item.section ?? "").toLowerCase();
  if (code === "disc" || section === "disc") return "disc";
  if (code === "talents_mapping" || code === "bigfive" || code === "enneagram" || code === "msai") {
    return "likert";
  }
  const options = Array.isArray(item.options) ? item.options : [];
  const likertValues = options.length === 5 && options.every((opt, index) => opt.value === String(index + 1));
  if (likertValues) return "likert";
  return "choice";
}

export function isAnswerComplete(
  testCode: string,
  item: { section?: string | null; options?: OptionLike[] | string },
  value: string | undefined,
): boolean {
  if (!value) return false;
  if (widgetForItem(testCode, item) === "disc") return isDiscAnswerComplete(value);
  return true;
}
