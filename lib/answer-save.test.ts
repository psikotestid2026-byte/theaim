import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  AnswerSaver,
  SAVE_BACKOFF_MS,
  SAVE_MAX_INFLIGHT,
  classifySaveResponse,
  retryDelayMs,
  saveBackoffMs,
  sectionAdvance,
} from "./answer-save";

describe("answer save policy", () => {
  it("backs off and then keeps retrying at the last delay", () => {
    assert.equal(saveBackoffMs(1), SAVE_BACKOFF_MS[0]);
    assert.equal(saveBackoffMs(2), SAVE_BACKOFF_MS[1]);
    assert.equal(saveBackoffMs(8), SAVE_BACKOFF_MS[SAVE_BACKOFF_MS.length - 1]);
    assert.equal(retryDelayMs(1, true), 0);
    assert.equal(retryDelayMs(2, true), null);
  });

  it("does not finish a subtest while a save is in flight or still retrying", () => {
    assert.equal(sectionAdvance({ intent: "confirm", busy: 1, retryable: 0 }), "stay");
    assert.equal(sectionAdvance({ intent: "confirm", busy: 0, retryable: 2 }), "stay");
    assert.equal(sectionAdvance({ intent: "confirm", busy: 0, retryable: 0 }), "confirm");
    assert.equal(sectionAdvance({ intent: "expire", busy: 1, retryable: 1 }), "stay");
    assert.equal(sectionAdvance({ intent: "expire", busy: 0, retryable: 1 }), "advance");
  });

  it("classifies closed sections apart from network failures", () => {
    assert.equal(classifySaveResponse(200), "saved");
    assert.equal(classifySaveResponse(409, "section_closed"), "closed");
    assert.equal(classifySaveResponse(409, "expired"), "closed");
    assert.equal(classifySaveResponse(400, "invalid_answer"), "rejected");
    assert.equal(classifySaveResponse(500), "retry");
    assert.equal(classifySaveResponse(0), "retry");
  });

  it("acks a save, retries a dropped one, and caps how many run at once", () => {
    const saver = new AnswerSaver({ 1: "a" });
    saver.local(2, "b");
    saver.local(3, "c");
    saver.local(4, "d");
    assert.deepEqual(saver.unsavedIds(), [2, 3, 4]);
    const first = saver.claim(SAVE_MAX_INFLIGHT);
    const second = saver.claim(SAVE_MAX_INFLIGHT);
    assert.equal(saver.claim(SAVE_MAX_INFLIGHT), null);
    assert.equal(first, 2);
    assert.equal(second, 3);
    assert.equal(saver.finish(2, "saved", "b"), null);
    assert.equal(saver.unsavedIds().includes(2), false);
    assert.equal(saver.finish(3, "retry", "c"), SAVE_BACKOFF_MS[0]);
    assert.equal(saver.claim(SAVE_MAX_INFLIGHT), 4);
    saver.hurry();
    saver.releaseBackoff(3);
    assert.equal(saver.retryableIds().includes(3), true);
  });

  it("stops an expired flush after one extra try", () => {
    const saver = new AnswerSaver();
    saver.intent = "expire";
    saver.local(9, "1");
    assert.equal(saver.claim(1), 9);
    assert.equal(saver.finish(9, "retry", "1"), 0);
    assert.equal(saver.claim(1), 9);
    assert.equal(saver.finish(9, "retry", "1"), null);
    assert.equal(saver.retryableIds().length, 0);
    assert.deepEqual(saver.unsavedIds(), [9]);
    assert.equal(sectionAdvance({ intent: "expire", busy: saver.busy(), retryable: saver.retryableIds().length }), "advance");
  });

  it("does not wait on the redis buffer before acknowledging an answer", () => {
    const src = readFileSync(new URL("../app/api/test-responses/route.ts", import.meta.url), "utf8");
    assert.equal(src.includes("await bufferAnswer"), false);
    assert.match(src, /void bufferAnswer/);
    assert.match(src, /loadAnswerWriteContext/);
  });
});
