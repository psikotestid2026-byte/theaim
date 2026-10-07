import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANSWER_GRACE_MS,
  answersStillAccepted,
  isAttemptExpired,
  isTimedTest,
  remainingMs,
  timedDurationSec,
} from "./test-timer";

describe("timed attempts", () => {
  it("times WPT for 12 minutes and leaves personality tests untimed", () => {
    assert.equal(timedDurationSec("wpt"), 720);
    assert.equal(isTimedTest("WPT"), true);
    for (const code of ["mbti", "disc", "papi", "bigfive", "enneagram", "riasec", "msdt", "msai", "talents_mapping", "ist"]) {
      assert.equal(isTimedTest(code), false, code);
    }
  });

  it("expires on the server clock and keeps a short grace for late answers", () => {
    const start = Date.parse("2026-10-07T10:00:00.000Z");
    const duration = 720;
    const deadline = start + duration * 1000;
    assert.equal(isAttemptExpired(start, duration, deadline - 1), false);
    assert.equal(isAttemptExpired(start, duration, deadline), true);
    assert.equal(answersStillAccepted(start, duration, deadline + ANSWER_GRACE_MS), true);
    assert.equal(answersStillAccepted(start, duration, deadline + ANSWER_GRACE_MS + 1), false);
    assert.equal(remainingMs(start, duration, deadline + 5000), 0);
    assert.equal(remainingMs(start, duration, start + 1000), duration * 1000 - 1000);
  });
});
