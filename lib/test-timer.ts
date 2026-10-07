/** Cognitive tests with a real countdown. Personality instruments stay untimed. */
export const TIMED_TEST_SECONDS: Record<string, number> = {
  wpt: 720,
};

/** Answers posted just after the clock hits zero are still stored. */
export const ANSWER_GRACE_MS = 10_000;

/** Shown before an expired attempt redirects, and again on the result page. */
export const EXPIRY_AUTO_SUBMIT_HEADING = "Waktu habis — jawaban Anda dikirim otomatis";

/** How long the runner keeps the expiry notice on screen before sending the result. */
export const EXPIRY_NOTICE_MS = 1_800;

export function expiryAnsweredLine(answered: number, total: number): string {
  return `${answered} dari ${total} soal terjawab`;
}

export function timedDurationSec(testCode: string): number | null {
  const seconds = TIMED_TEST_SECONDS[testCode.toLowerCase()];
  return typeof seconds === "number" ? seconds : null;
}

export function isTimedTest(testCode: string): boolean {
  return timedDurationSec(testCode) !== null;
}

export function deadlineMs(startedAtMs: number, durationSec: number): number {
  return startedAtMs + durationSec * 1000;
}

export function isAttemptExpired(startedAtMs: number, durationSec: number, nowMs: number): boolean {
  return nowMs >= deadlineMs(startedAtMs, durationSec);
}

export function answersStillAccepted(startedAtMs: number, durationSec: number, nowMs: number): boolean {
  return nowMs <= deadlineMs(startedAtMs, durationSec) + ANSWER_GRACE_MS;
}

export function remainingMs(startedAtMs: number, durationSec: number, nowMs: number): number {
  return Math.max(0, deadlineMs(startedAtMs, durationSec) - nowMs);
}

export function parseDbTimestamp(value: unknown): number | null {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? null : ms;
  }
  if (typeof value === "string" && value.trim()) {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}
