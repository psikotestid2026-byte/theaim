import { z } from "zod";

/** RuangTes DISC answer for one block: P = Paling (Most), K = Kurang (Least). Option indexes are 0-based. */
export const discAnswerSchema = z.object({
  P: z.number().int().min(0).max(7).nullable(),
  K: z.number().int().min(0).max(7).nullable(),
});

export type DiscAnswer = z.infer<typeof discAnswerSchema>;

export function encodeDiscAnswer(answer: DiscAnswer): string {
  return JSON.stringify({ P: answer.P, K: answer.K });
}

export function parseDiscAnswer(raw: string | null | undefined): DiscAnswer {
  if (!raw) return { P: null, K: null };
  try {
    const parsed = discAnswerSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    // Not a DISC payload.
  }
  return { P: null, K: null };
}

export function isDiscAnswerComplete(raw: string | null | undefined): boolean {
  const answer = parseDiscAnswer(raw);
  return answer.P !== null && answer.K !== null && answer.P !== answer.K;
}
