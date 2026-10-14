/** Client policy for answer saves. The database ack is the saved state. */

export const SAVE_ATTEMPT_TIMEOUT_MS = 8_000;
export const SAVE_MAX_INFLIGHT = 2;
export const SAVE_BACKOFF_MS = [400, 1_000, 2_000, 4_000] as const;

export type SaveIntent = "none" | "confirm" | "expire";
export type SaveOutcome = "saved" | "retry" | "rejected";

export function saveBackoffMs(failedAttempts: number): number {
  const index = Math.min(SAVE_BACKOFF_MS.length, Math.max(1, failedAttempts)) - 1;
  return SAVE_BACKOFF_MS[index];
}

/**
 * Expire flushes once more immediately, then stops. A manual finish keeps
 * retrying, with the delay capped at the last backoff step.
 */
export function retryDelayMs(failedAttempts: number, expireFlush: boolean): number | null {
  if (expireFlush) return failedAttempts >= 2 ? null : 0;
  return saveBackoffMs(failedAttempts);
}

export function classifySaveResponse(status: number, error?: string): SaveOutcome | "closed" {
  if (status >= 200 && status < 300) return "saved";
  if (status === 409 && (error === "section_closed" || error === "expired")) return "closed";
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409) return "rejected";
  return "retry";
}

export function sectionAdvance(input: { intent: SaveIntent; busy: number; retryable: number }): "stay" | "confirm" | "advance" {
  if (input.intent === "none") return "stay";
  if (input.busy > 0) return "stay";
  if (input.intent === "expire") return "advance";
  if (input.retryable > 0) return "stay";
  return "confirm";
}

/**
 * Tracks desired answers against the last value the server accepted.
 * `busy` counts in-flight posts and scheduled retries.
 */
export class AnswerSaver {
  private desired = new Map<number, string>();
  private acked = new Map<number, string>();
  private inflight = new Set<number>();
  private backoff = new Set<number>();
  private attempts = new Map<number, number>();
  private rejected = new Map<number, string>();
  intent: SaveIntent = "none";

  constructor(initial?: Record<number, string>) {
    for (const [key, value] of Object.entries(initial ?? {})) {
      if (!value) continue;
      const id = Number(key);
      this.desired.set(id, value);
      this.acked.set(id, value);
    }
  }

  local(id: number, value: string) {
    this.desired.set(id, value);
    if (this.rejected.get(id) !== value) this.rejected.delete(id);
  }

  value(id: number): string | undefined {
    return this.desired.get(id);
  }

  unsavedIds(): number[] {
    const ids: number[] = [];
    for (const [id, value] of this.desired) {
      if (this.acked.get(id) !== value) ids.push(id);
    }
    return ids;
  }

  retryableIds(): number[] {
    return this.unsavedIds().filter((id) => this.rejected.get(id) !== this.desired.get(id));
  }

  busy(): number {
    return this.inflight.size + this.backoff.size;
  }

  claim(maxInflight: number): number | null {
    if (this.inflight.size >= maxInflight) return null;
    for (const id of this.retryableIds()) {
      if (this.inflight.has(id) || this.backoff.has(id)) continue;
      this.inflight.add(id);
      return id;
    }
    return null;
  }

  /**
   * Record the outcome of the value that was posted.
   * Returns how long to wait before another try, or null to stop.
   */
  finish(id: number, outcome: SaveOutcome, value: string): number | null {
    this.inflight.delete(id);
    if (this.desired.get(id) !== value) return 0;
    if (outcome === "saved") {
      this.acked.set(id, value);
      this.attempts.delete(id);
      this.rejected.delete(id);
      return null;
    }
    if (outcome === "rejected") {
      this.rejected.set(id, value);
      return null;
    }
    const nextAttempt = (this.attempts.get(id) ?? 0) + 1;
    this.attempts.set(id, nextAttempt);
    const delay = retryDelayMs(nextAttempt, this.intent === "expire");
    if (delay === null) {
      this.rejected.set(id, value);
      return null;
    }
    if (delay > 0) this.backoff.add(id);
    return delay;
  }

  releaseBackoff(id: number) {
    this.backoff.delete(id);
  }

  hurry() {
    this.backoff.clear();
  }

  resetAttempts() {
    this.attempts.clear();
    this.rejected.clear();
  }
}
