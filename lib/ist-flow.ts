/**
 * IST runs subtest by subtest. Each subtest has its own server clock
 * (test_sessions.section_started_at); ME starts with a memorize phase.
 * Pure helpers shared by the runner, the section-timer route, and answer writes.
 * The schedule (codes and time limits) is loaded from scoring_configs, not from git.
 */
import type { IstScheduleEntry } from "./ist-types";

/** Answers sent just after a subtest clock hits zero are still stored. */
export const IST_SECTION_GRACE_MS = 10_000;

export type SectionStarts = Record<string, number>;
export type IstPhase = "memorize" | "answer" | "over";

export function istSubtestByCode(schedule: readonly IstScheduleEntry[], code: string): IstScheduleEntry | null {
  return schedule.find((row) => row.code === code.toUpperCase()) ?? null;
}

export function istSectionIndex(schedule: readonly IstScheduleEntry[], code: string): number {
  return schedule.findIndex((row) => row.code === code.toUpperCase());
}

export function istSectionTotalSec(sub: Pick<IstScheduleEntry, "timeLimitSec" | "memorizeSec">): number {
  return (sub.memorizeSec ?? 0) + sub.timeLimitSec;
}

export function istPhaseAt(
  sub: Pick<IstScheduleEntry, "timeLimitSec" | "memorizeSec">,
  startedMs: number,
  nowMs: number,
): { phase: IstPhase; endsMs: number } {
  const memorizeEnds = startedMs + (sub.memorizeSec ?? 0) * 1000;
  const answerEnds = startedMs + istSectionTotalSec(sub) * 1000;
  if (nowMs < memorizeEnds) return { phase: "memorize", endsMs: memorizeEnds };
  if (nowMs < answerEnds) return { phase: "answer", endsMs: answerEnds };
  return { phase: "over", endsMs: answerEnds };
}

/** Index of the last subtest whose clock has started, or -1. */
export function istLastStartedIndex(schedule: readonly IstScheduleEntry[], starts: SectionStarts): number {
  let last = -1;
  schedule.forEach((row, index) => {
    if (typeof starts[row.code] === "number") last = index;
  });
  return last;
}

export type StartCheck = { ok: true; alreadyStarted: boolean } | { ok: false; reason: "unknown_section" | "out_of_order" | "section_closed" };

/** A subtest may start only after every earlier one has started, and never after a later one. */
export function istCanStartSection(schedule: readonly IstScheduleEntry[], code: string, starts: SectionStarts): StartCheck {
  const index = istSectionIndex(schedule, code);
  if (index < 0) return { ok: false, reason: "unknown_section" };
  if (typeof starts[schedule[index].code] === "number") return { ok: true, alreadyStarted: true };
  if (istLastStartedIndex(schedule, starts) > index) return { ok: false, reason: "section_closed" };
  for (let i = 0; i < index; i++) {
    if (typeof starts[schedule[i].code] !== "number") return { ok: false, reason: "out_of_order" };
  }
  return { ok: true, alreadyStarted: false };
}

/**
 * Answers for a subtest are accepted only in its answer phase (plus grace),
 * and never once a later subtest has started.
 */
export function istAnswerWindowOpen(schedule: readonly IstScheduleEntry[], code: string, starts: SectionStarts, nowMs: number): boolean {
  const sub = istSubtestByCode(schedule, code);
  const startedMs = sub ? starts[sub.code] : undefined;
  if (!sub || typeof startedMs !== "number") return false;
  if (istLastStartedIndex(schedule, starts) > istSectionIndex(schedule, sub.code)) return false;
  const memorizeEnds = startedMs + (sub.memorizeSec ?? 0) * 1000;
  const answerEnds = startedMs + istSectionTotalSec(sub) * 1000;
  return nowMs >= memorizeEnds && nowMs <= answerEnds + IST_SECTION_GRACE_MS;
}

/** The participant reached the last subtest, so unanswered items no longer block submission. */
export function istFlowReachedEnd(schedule: readonly IstScheduleEntry[], starts: SectionStarts): boolean {
  return schedule.length > 0 && istLastStartedIndex(schedule, starts) === schedule.length - 1;
}

/** ME word list may be sent only while that subtest is the latest one and still in its memorize phase. */
export function istMemorizePhaseOpen(schedule: readonly IstScheduleEntry[], starts: SectionStarts, nowMs: number): boolean {
  const me = istSubtestByCode(schedule, "ME");
  const index = istSectionIndex(schedule, "ME");
  if (!me || index < 0) return false;
  const started = starts[me.code];
  if (typeof started !== "number") return false;
  if (istLastStartedIndex(schedule, starts) !== index) return false;
  // A follower read can report "now" a little earlier than the start just written.
  const at = Math.max(nowMs, started);
  return istPhaseAt(me, started, at).phase === "memorize";
}

/**
 * Section start already returns the word list. Call memorize-list only when
 * this page was reloaded into a running memorize phase, and only once that
 * clock is already on screen.
 */
export function shouldFetchMemorizeList(hasList: boolean, reloadedWithClock: boolean, clockVisible: boolean): boolean {
  return !hasList && reloadedWithClock && clockVisible;
}

/** How many times the memorize-list route re-reads the clock before it 404s. */
export const MEMORIZE_LIST_READ_ATTEMPTS = 4;
export const MEMORIZE_LIST_READ_GAP_MS = 200;

/**
 * Re-read until `ready` or attempts run out. The first read is immediate.
 * Used so a section start and the following list read survive a short replica lag.
 */
export async function pollUntil<T>(
  read: () => Promise<T>,
  ready: (value: T) => boolean,
  attempts = MEMORIZE_LIST_READ_ATTEMPTS,
  gapMs = MEMORIZE_LIST_READ_GAP_MS,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<T> {
  let value = await read();
  for (let i = 1; i < attempts && !ready(value); i++) {
    await sleep(gapMs);
    value = await read();
  }
  return value;
}
