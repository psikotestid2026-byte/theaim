import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatGap } from "@/components/test/RetailScoreDetail";

describe("MSAI gap display", () => {
  it("prints two decimal places", () => {
    assert.equal(formatGap(0.6000000000000001), "0.60");
    assert.equal(formatGap(-0.19999999999999996), "-0.20");
    assert.equal(formatGap(2), "2.00");
    assert.equal(formatGap(2.8), "2.80");
  });
});
