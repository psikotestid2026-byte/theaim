import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatResultDate } from "./format-date";

describe("result date", () => {
  it("uses Asia/Jakarta so an early-morning WIB result stays on that calendar day", () => {
    assert.equal(formatResultDate("2026-10-07T20:30:00.000Z"), "8 Oktober 2026");
    assert.equal(formatResultDate("2026-10-07T16:30:00.000Z"), "7 Oktober 2026");
  });
});
